# GOTY 2026 — Sistema de Votação

Bolão entre amigos para o Game of The Year 2026.  
Frontend em **React + TypeScript + Vite**, backend em **Flask** com suporte a 3 backends de dados.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Python 3, Flask, Flask-CORS |
| Dados | Firestore \| CSV \| PostgreSQL (via `.env`) |

---

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- Docker (opcional)

---

## Configuração

### 1. Variáveis de ambiente

Copie e edite o `.env` na raiz do projeto:

```bash
cp .env.example .env
```

```env
FLASK_ENV=development
PORT=5000

# Backend de dados: firestore | csv | postgres
DB_BACKEND=csv

# CSV
CSV_FILE=data/usuarios.csv

# Firestore
GOOGLE_APPLICATION_CREDENTIALS=backend/credentials/firestore-key.json

# PostgreSQL
PG_USER=
PG_PASSWORD=
PG_HOST=
PG_PORT=5432
PG_DATABASE=

# Login Google + LGPD
GOOGLE_CLIENT_ID=          # OAuth 2.0 Client ID (Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=     # mesmo valor, exposto ao frontend
VOTER_HASH_SECRET=         # segredo forte e FIXO (gera o voter_id anônimo)
ADMIN_VOTER_IDS=           # hashes (voter_id) dos admins, separados por vírgula

# Produção
CORS_ORIGINS=              # origens permitidas, separadas por vírgula
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

> Firestore: coloque o service account em `backend/credentials/firestore-key.json`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Build de produção

```bash
cd frontend
npm run build
# Os arquivos vão para backend/static/ (servidos pelo Flask)
```

### 5. Produção (gunicorn)

Em produção, não use `python app.py` (servidor de dev). Rode com **gunicorn**:

```bash
cd backend
FLASK_ENV=production gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

> Defina também `CORS_ORIGINS` com o domínio real e use `DB_BACKEND=firestore` ou `postgres` — **CSV é só para dev** (sem garantia de concorrência).

### 6. Testes

Teste de contrato dos 3 backends de dados (backends sem credencial no ambiente são pulados):

```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

---

## Docker

Imagem multi-stage: build do React (Node 20) → Flask servido por **gunicorn** (porta 8080).

```bash
cd docker
docker compose --env-file ../config/.env up --build -d
# ou use o script: ./docker-run.sh (Linux/Mac) | docker-run.bat (Windows)
```

> O `--env-file` é obrigatório: alimenta o `VITE_GOOGLE_CLIENT_ID` no build do frontend e os segredos de runtime (`VOTER_HASH_SECRET`, `ADMIN_VOTER_IDS`, `DB_BACKEND`, ...) via `env_file`. **Nenhum segredo entra na imagem** — a credencial do Firestore é montada como volume read-only.

Para o login funcionar via Docker, adicione `http://localhost:8080` (ou o domínio real) nas **Authorized JavaScript origins** do OAuth Client no Google Cloud Console e no `CORS_ORIGINS`.

---

## Estrutura

```
├── backend/
│   ├── app.py                  # Servidor Flask
│   ├── requirements.txt
│   ├── connect/                # Repositórios de dados
│   │   ├── db_csv.py
│   │   ├── db_firestore.py
│   │   └── db_postgres.py
│   ├── data/                   # Fonte única de dados
│   │   ├── categories.json     # Categorias e nominees
│   │   ├── game-images.json    # URLs das capas dos jogos
│   │   ├── config.json         # show_results true/false
│   │   ├── winners.json        # Vencedores por categoria
│   │   └── usuarios.csv        # Votos (backend CSV)
│   └── credentials/            # Service account GCP (não versionado)
├── frontend/
│   ├── App.tsx
│   ├── components/
│   ├── services/api.ts
│   └── types.ts
├── API.md                      # Documentação completa da API
└── docker/
```

---

## Backends de dados

| `DB_BACKEND` | Descrição |
|---|---|
| `csv` | Arquivo `backend/data/usuarios.csv` — sem dependências externas |
| `firestore` | Google Firestore — requer credenciais GCP |
| `postgres` | PostgreSQL — requer `PG_*` no `.env` |

---

## API

Documentação completa com exemplos cURL e JSON em [`API.md`](API.md).

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/db-status` | Status do backend ativo |
| GET | `/api/votes` | Todos os votos (nickname/votes/timestamp) |
| GET | `/api/results` | Resultados agregados + ranking (servidor) |
| POST | `/api/vote` | Registrar voto 🔒 (login Google, 1 por pessoa) |
| GET | `/api/me` | Voto do usuário logado 🔒 (404 se não votou) |
| DELETE | `/api/me` | Apagar o próprio voto 🔒 (LGPD) |
| POST | `/api/delete` | Resetar a base 🔒 (admin) |
| GET | `/api/config` | Configurações |
| POST | `/api/toggle-results` | Liga/desliga resultados |
| GET | `/api/winners` | Vencedores por categoria |
| POST | `/api/winners` | Definir vencedores |
| GET | `/api/categories` | Categorias com nominees e imagens |

---

## Segurança

- Login Google obrigatório para votar (ID Token validado no backend: `aud`, `iss`, expiração, email verificado, tolerância de 10s de clock skew).
- Identidade do voto = `voter_id` (HMAC-SHA256 do e-mail com `VOTER_HASH_SECRET`) — unicidade atômica no banco (Firestore `create()` / Postgres `ON CONFLICT`).
- Rate limiting em `/api/vote` e `DELETE /api/me` (flask-limiter, 10/min).
- Nickname sanitizado no servidor (anti-XSS); votos validados contra `categories.json`; SQL sempre parametrizado.
- Rotas admin protegidas por hash de e-mail (`ADMIN_VOTER_IDS`) — nenhum e-mail em texto.
- CORS restrito às origens conhecidas (`CORS_ORIGINS` em produção).
- Headers de segurança em todas as respostas (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; HSTS em produção).
- Erros genéricos ao cliente; detalhes só no log — nunca token/e-mail/segredos.
- Apenas o `GOOGLE_CLIENT_ID` (público por natureza) vai pro bundle do frontend — nenhum segredo passa pelo `define` do Vite.

Nunca commite (protegidos pelo `.gitignore`):
- `backend/credentials/` — service account keys (`*-key.json`, `service-account*.json`)
- `config/.env` e qualquer `.env` — contém `VOTER_HASH_SECRET`, `ADMIN_VOTER_IDS`, credenciais Postgres
- `backend/data/usuarios.csv` — votos do backend CSV (dev)
- `__pycache__/`, `.venv/`, `.vite/` — artefatos locais

> `backend/data/config.json` e `winners.json` são versionados de propósito (estado público do bolão — não contêm dados pessoais).

## Privacidade (LGPD)

O e-mail **nunca é persistido** — só o hash irreversível `voter_id` (HMAC-SHA256 com segredo do servidor), o nickname digitado, os votos e o timestamp. Detalhes em [`PRIVACY.md`](PRIVACY.md).
