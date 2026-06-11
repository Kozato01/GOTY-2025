"""API do GOTY — votação, resultados e administração.

Servido em produção via gunicorn (`app:app`, ver docker/Dockerfile).
"""
import html
import json
import logging
import os
import re
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Ambiente — precisa rodar ANTES dos imports locais (auth/connect leem o .env)
# ---------------------------------------------------------------------------
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "config", ".env"))

from auth import require_admin, require_google_auth
from connect import get_repository
from connect.base import DuplicateVoteError

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("goty")

# Silencia o log de acesso por-requisição do werkzeug (mantém só warnings/erros).
logging.getLogger("werkzeug").setLevel(logging.WARNING)


# O healthcheck do Docker bate em /api/health a cada 30s — fora do access log do gunicorn.
class _HealthCheckLogFilter(logging.Filter):
    def filter(self, record):
        return "/api/health" not in record.getMessage()


logging.getLogger("gunicorn.access").addFilter(_HealthCheckLogFilter())

# ---------------------------------------------------------------------------
# App, rate limiting, CORS e headers de segurança
# ---------------------------------------------------------------------------
app = Flask(__name__, static_folder="static", static_url_path="")

# Rate limiting básico (anti-abuso). Limites aplicados por rota abaixo.
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address

    limiter = Limiter(get_remote_address, app=app, storage_uri="memory://")
    _rate_limit = limiter.limit
except ImportError:  # flask-limiter não instalado → segue sem limites (dev)
    logger.warning("flask-limiter não instalado — rate limiting desativado")

    def _rate_limit(_spec):
        def decorator(fn):
            return fn
        return decorator

# CORS restrito às origens conhecidas (dev) + configurável por env em produção
_default_origins = "http://localhost:3000,http://localhost:5000,http://127.0.0.1:3000,http://127.0.0.1:5000"
_allowed_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]
CORS(app, origins=_allowed_origins)


# Headers de segurança em todas as respostas (anti-MIME-sniffing/clickjacking)
@app.after_request
def set_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    if os.getenv("FLASK_ENV") == "production":
        response.headers.setdefault(
            "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
        )
    return response


# ---------------------------------------------------------------------------
# Repositório de votos e caminhos de dados
# ---------------------------------------------------------------------------
# Inicializa o repositório de votos conforme DB_BACKEND no .env
repo = get_repository()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
WINNERS_FILE = os.path.join(DATA_DIR, "winners.json")
CATEGORIES_FILE = os.path.join(DATA_DIR, "categories.json")
GAME_IMAGES_FILE = os.path.join(DATA_DIR, "game-images.json")

NICKNAME_MAX_LEN = 30
PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x800/1e293b/38bdf8?text=Game"


# ---------------------------------------------------------------------------
# Helpers — persistência JSON
# ---------------------------------------------------------------------------
def _read_json(path, default):
    """Lê um JSON do disco; em arquivo ausente ou erro, retorna `default`."""
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        logger.exception("Erro ao ler %s", os.path.basename(path))
    return default


def _write_json(path, data) -> bool:
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        logger.exception("Erro ao gravar %s", os.path.basename(path))
        return False


def load_config() -> dict:
    return _read_json(CONFIG_FILE, {"show_results": True})


def save_config(config) -> bool:
    return _write_json(CONFIG_FILE, config)


def load_winners() -> dict:
    return _read_json(WINNERS_FILE, {})


def save_winners(winners_data) -> bool:
    return _write_json(WINNERS_FILE, winners_data)


# ---------------------------------------------------------------------------
# Helpers — validação de votos
# ---------------------------------------------------------------------------
def sanitize_nickname(raw: str) -> str:
    """Limpa o nickname: trim, sem HTML/control chars, tamanho limitado (anti-XSS)."""
    if not isinstance(raw, str):
        return ""
    value = raw.strip()
    value = re.sub(r"[\x00-\x1f<>]", "", value)  # remove control chars e < >
    value = html.escape(value, quote=False)
    return value[:NICKNAME_MAX_LEN]


def load_categories_data() -> tuple[dict, list]:
    """Retorna ({categoria: set(títulos válidos)}, lista crua de categorias)."""
    try:
        categories = _read_json(CATEGORIES_FILE, {}).get("categories", [])
        valid = {c["name"]: {n["title"] for n in c.get("nominees", [])} for c in categories}
        return valid, categories
    except Exception:
        logger.exception("Erro ao processar categories.json")
        return {}, []


def validate_votes(votes) -> str | None:
    """Valida os votos contra categories.json. Retorna mensagem de erro ou None."""
    if not isinstance(votes, dict) or not votes:
        return "Votos inválidos ou vazios"
    valid_map, _ = load_categories_data()
    if not valid_map:
        return None  # se não há categorias carregadas, não bloqueia
    for categoria, jogo in votes.items():
        if categoria not in valid_map:
            return f"Categoria inválida: {categoria}"
        if jogo not in valid_map[categoria]:
            return f"Indicado inválido para '{categoria}': {jogo}"
    return None


# ---------------------------------------------------------------------------
# Rotas — votação (usuário autenticado via Google)
# ---------------------------------------------------------------------------
@app.route("/api/vote", methods=["POST"])
@_rate_limit("10 per minute")
@require_google_auth
def save_vote():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        if "nickname" not in data or "votes" not in data:
            return jsonify({"error": "Campos 'nickname' e 'votes' são obrigatórios"}), 400

        if not repo.is_available():
            return jsonify({"error": "Backend de dados não disponível"}), 503

        nickname = sanitize_nickname(data.get("nickname", ""))
        if not nickname:
            return jsonify({"error": "Nickname inválido"}), 400

        votes = data["votes"]
        err = validate_votes(votes)
        if err:
            return jsonify({"error": err}), 400

        # Identidade vem do token Google (g.voter_id), nunca do body.
        timestamp = datetime.now().isoformat()
        result = repo.save_vote(g.voter_id, nickname, timestamp, votes)
        return jsonify(result), 201

    except DuplicateVoteError:
        return jsonify({"error": "Você já votou. Cada pessoa pode votar apenas uma vez."}), 409
    except Exception:
        logger.exception("Erro ao salvar voto")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/me", methods=["GET"])
@require_google_auth
def get_my_vote():
    """Retorna o voto do usuário logado ({nickname, votes, timestamp}) ou 404.

    Permite ao frontend detectar usuário recorrente: quem já votou não
    redigita o nickname — vai direto aos resultados.
    """
    try:
        if not repo.is_available():
            return jsonify({"error": "Backend de dados não disponível"}), 503
        vote = repo.get_vote(g.voter_id)
        if vote:
            return jsonify(vote), 200
        return jsonify({"error": "Nenhum voto encontrado"}), 404
    except Exception:
        logger.exception("Erro ao buscar voto do usuário")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/me", methods=["DELETE"])
@_rate_limit("10 per minute")
@require_google_auth
def delete_my_vote():
    """LGPD — direito de exclusão: o usuário logado apaga o próprio voto."""
    try:
        if not repo.is_available():
            return jsonify({"error": "Backend de dados não disponível"}), 503
        count = repo.delete_vote(g.voter_id)
        if count > 0:
            return jsonify({"status": "success", "message": "Seu voto foi apagado"}), 200
        return jsonify({"status": "info", "message": "Nenhum voto encontrado"}), 404
    except Exception:
        logger.exception("Erro ao apagar voto do usuário")
        return jsonify({"error": "Erro interno do servidor"}), 500


# ---------------------------------------------------------------------------
# Rotas — leitura pública (resultados, vencedores, categorias)
# ---------------------------------------------------------------------------
@app.route("/api/votes", methods=["GET"])
def get_all_votes():
    try:
        votes_list = repo.get_all_votes()
        logger.info("%d votos retornados", len(votes_list))
        return jsonify(votes_list), 200
    except Exception:
        logger.exception("Erro ao ler votos")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/results", methods=["GET"])
def get_results():
    """Resultados agregados (sem votos crus) + ranking de pontos calculado no servidor."""
    try:
        results = repo.get_results()
        winners = load_winners()
        _, categories = load_categories_data()
        points_by_cat = {c["name"]: c.get("points", 0) for c in categories}

        # Ranking: cruza cada voto com os vencedores reais.
        ranking = []
        if winners:
            for v in repo.get_all_votes():
                score = sum(
                    points_by_cat.get(cat, 0)
                    for cat, jogo in (v.get("votes") or {}).items()
                    if winners.get(cat) == jogo
                )
                ranking.append({"nickname": v.get("nickname", ""), "score": score})
            ranking.sort(key=lambda r: r["score"], reverse=True)

        results["ranking"] = ranking
        return jsonify(results), 200
    except Exception:
        logger.exception("Erro ao calcular resultados")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/winners", methods=["GET"])
def get_winners():
    return jsonify(load_winners())


@app.route("/api/categories")
def get_categories():
    try:
        data = _read_json(CATEGORIES_FILE, None)
        if data is None:
            return jsonify({"error": "Erro ao carregar categorias"}), 500

        game_images = _read_json(GAME_IMAGES_FILE, {})
        for category in data.get("categories", []):
            for nominee in category.get("nominees", []):
                nominee["imageUrl"] = game_images.get(nominee["title"], PLACEHOLDER_IMAGE)

        return jsonify(data)
    except Exception:
        logger.exception("Erro ao carregar categories.json")
        return jsonify({"error": "Erro ao carregar categorias"}), 500


# ---------------------------------------------------------------------------
# Rotas — administração
# ---------------------------------------------------------------------------
@app.route("/api/delete", methods=["POST"])
@require_admin
def delete_votes():
    """Admin — reset da base. Body: {"nickname": "all"}."""
    try:
        data = request.get_json(silent=True) or {}
        target = str(data.get("nickname", "")).strip().lower()
        if not repo.is_available():
            return jsonify({"error": "Backend de dados não disponível"}), 503

        if target == "all":
            count = repo.delete_all_votes()
            return jsonify({"status": "success", "message": f"Todos os {count} votos foram apagados"}), 200

        return jsonify({"error": "Use {\"nickname\": \"all\"} para resetar a base"}), 400
    except Exception:
        logger.exception("Erro ao deletar votos")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/toggle-results", methods=["POST"])
@require_admin
def toggle_results():
    try:
        config = load_config()
        new_state = not config.get("show_results", True)
        config["show_results"] = new_state
        if save_config(config):
            return jsonify({"status": "success", "show_results": new_state}), 200
        return jsonify({"error": "Erro ao salvar configuração"}), 500
    except Exception:
        logger.exception("Erro ao alternar resultados")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/winners", methods=["POST"])
@require_admin
def set_winners():
    try:
        data = request.get_json()
        if save_winners(data):
            return jsonify({"success": True})
        return jsonify({"success": False}), 500
    except Exception:
        logger.exception("Erro ao salvar vencedores")
        return jsonify({"success": False}), 400


# ---------------------------------------------------------------------------
# Rotas — configuração e status
# ---------------------------------------------------------------------------
@app.route("/api/config", methods=["GET"])
def get_config():
    try:
        config = load_config()
        return jsonify({
            "status": "success",
            "config": {
                "showResults": config.get("show_results", True),
                "backendType": os.getenv("DB_BACKEND", "firestore"),
                "backendAvailable": repo.is_available(),
            },
        }), 200
    except Exception:
        logger.exception("Erro ao obter configuração")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/db-status", methods=["GET"])
def db_status():
    try:
        backend = os.getenv("DB_BACKEND", "firestore")
        available = repo.is_available()
        status_info = {
            "backend": backend,
            "available": available,
            "status": f"✅ {backend} conectado" if available else f"❌ {backend} não disponível",
        }
        if available:
            try:
                votes = repo.get_all_votes()
                status_info["documents_count"] = len(votes)
            except Exception:
                status_info["documents_count"] = 0
        else:
            status_info["documents_count"] = 0
        return jsonify(status_info), 200
    except Exception:
        logger.exception("Erro no db-status")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "API funcionando!", "timestamp": datetime.now().isoformat()}), 200


# ---------------------------------------------------------------------------
# SPA — serve o build do React (backend/static)
# ---------------------------------------------------------------------------
@app.route("/")
def serve_react_app():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_react_static(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


# ---------------------------------------------------------------------------
# Execução direta (dev) — em produção o gunicorn importa `app` diretamente
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logger.info("Iniciando servidor Flask...")
    logger.info("Backend de dados: %s", os.getenv("DB_BACKEND", "firestore"))

    if not os.path.exists(CONFIG_FILE):
        save_config({"show_results": True})

    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") != "production"
    host = "0.0.0.0"

    logger.info("Servidor rodando em http://%s:%s", host, port)
    logger.info("Modo: %s", "PRODUÇÃO" if not debug else "DESENVOLVIMENTO")
    app.run(debug=debug, host=host, port=port)
