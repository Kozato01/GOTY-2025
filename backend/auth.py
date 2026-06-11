"""Autenticação Google (ID Token) e identidade anônima dos votos (LGPD).

Princípio LGPD: o email NUNCA é persistido. Ele é usado apenas em memória,
no momento da validação do token, para gerar um hash irreversível (voter_id)
via HMAC-SHA256 com um segredo do servidor (VOTER_HASH_SECRET).
"""
import os
import hmac
import hashlib
import logging
from functools import wraps

from flask import request, jsonify, g

logger = logging.getLogger(__name__)


def _client_id() -> str:
    return os.getenv("GOOGLE_CLIENT_ID", "")


def _hash_secret() -> bytes:
    secret = os.getenv("VOTER_HASH_SECRET")
    if not secret:
        raise RuntimeError(
            "VOTER_HASH_SECRET não configurado. Defina-o no .env (segredo forte e fixo)."
        )
    return secret.encode("utf-8")


def voter_id(email: str) -> str:
    """Gera identidade anônima e irreversível a partir do email.

    O email é normalizado (lower/trim) e descartado em seguida — nunca é
    armazenado nem retornado. Sem o VOTER_HASH_SECRET o hash não volta a ser email.
    """
    normalized = (email or "").strip().lower()
    return hmac.new(_hash_secret(), normalized.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_google_token(token: str) -> str | None:
    """Valida um ID Token do Google Identity Services.

    Retorna o voter_id (hash anônimo) se válido, ou None caso contrário.
    O email é usado só aqui dentro para gerar o hash e descartado.
    """
    if not token:
        return None
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            _client_id(),
            # Tolera pequeno desvio de relógio entre esta máquina e o Google
            # (evita "Token used too early" com relógio alguns segundos atrasado).
            clock_skew_in_seconds=10,
        )

        # Valida emissor explicitamente
        if info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
            logger.warning("Token rejeitado: emissor inválido")
            return None

        # Exige email verificado
        if not info.get("email_verified"):
            logger.warning("Token rejeitado: email não verificado")
            return None

        email = info.get("email")
        if not email:
            return None

        return voter_id(email)
    except ValueError as e:
        # Token inválido/expirado/aud incorreto
        logger.warning("Token Google inválido: %s", e)
        return None
    except Exception as e:
        logger.error("Erro ao verificar token Google: %s", e)
        return None


def _extract_bearer() -> str | None:
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[len("Bearer "):].strip()
    return None


def require_google_auth(fn):
    """Decorator: exige ID Token válido. Injeta g.voter_id (hash anônimo)."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer()
        vid = verify_google_token(token)
        if not vid:
            return jsonify({"error": "Autenticação Google obrigatória ou inválida"}), 401
        g.voter_id = vid
        return fn(*args, **kwargs)
    return wrapper


def is_admin(vid: str) -> bool:
    """True se o voter_id estiver na lista de admins (ADMIN_VOTER_IDS)."""
    admins = {a.strip() for a in os.getenv("ADMIN_VOTER_IDS", "").split(",") if a.strip()}
    return vid in admins


def require_admin(fn):
    """Decorator: exige token válido E que o voter_id seja admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer()
        vid = verify_google_token(token)
        if not vid:
            return jsonify({"error": "Autenticação Google obrigatória ou inválida"}), 401
        if not is_admin(vid):
            return jsonify({"error": "Acesso restrito a administradores"}), 403
        g.voter_id = vid
        return fn(*args, **kwargs)
    return wrapper
