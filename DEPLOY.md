# Deploy no servidor (SSH + Docker + Cloudflare Tunnel)

Guia de operação do GOTY 2026 no servidor. O app roda como dois containers
(`goty-app` na porta host **8020** e `postgres-goty`) e é exposto à internet
via túnel Cloudflare (`cloudflared`) que aponta para `localhost:8020`.

---

## 1. Primeira instalação

```bash
# No servidor
git clone <repo> && cd GOTY-2026
```

### 1.1 Configurar `config/.env`

Variáveis obrigatórias:

| Variável | Para quê |
|---|---|
| `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` | Login Google (mesmo valor) |
| `VOTER_HASH_SECRET` | HMAC do email → `voter_id`. **Fixo** — trocar invalida votos existentes |
| `ADMIN_VOTER_IDS` | Hash(es) admin separados por vírgula |
| `DB_BACKEND=postgres` | Backend de dados |
| `PG_USER` / `PG_PASSWORD` / `PG_DATABASE` / `PG_PORT` | Postgres (`PG_HOST` é sobrescrito p/ `postgres-goty` no compose) |

> ⚠️ Se a senha do Postgres tiver `$`, use `$$` dentro de arquivos lidos pelo
> Docker Compose ou evite o caractere. Teste a conexão após subir.

### 1.2 Registrar o domínio no Google Cloud

Google Cloud Console → APIs & Services → Credentials → OAuth Client:
adicionar em **Authorized JavaScript origins**:
- `https://<seu-dominio.com>` (domínio do túnel)
- `http://localhost:8020` (teste local, opcional)

Sem isso o botão de login retorna erro `origin_mismatch`.

### 1.3 Subir

```bash
./docker-run.sh
# equivalente a:
docker compose --env-file config/.env up --build -d
```

O `--env-file` é **obrigatório**: alimenta `VITE_GOOGLE_CLIENT_ID` no build do
front e os segredos de runtime via `env_file`. Nenhum segredo entra na imagem.

### 1.4 Túnel Cloudflare

O serviço `cloudflared` (roda em outro projeto/stack com `network_mode: host`)
aponta o hostname público para `http://localhost:8020` no ingress do túnel.
Exemplo de trecho do `config.yml` do cloudflared:

```yaml
ingress:
  - hostname: goty.seudominio.com
    service: http://localhost:8020
  - service: http_status:404
```

---

## 2. Atualização (deploy de nova versão)

```bash
git pull
./docker-run.sh          # rebuild + up -d (sem downtime perceptível)
docker image prune -f    # limpa imagens antigas (opcional)
```

---

## 3. Verificação pós-deploy (checklist)

```bash
# Container saudável?
docker compose ps                          # ambos "healthy"

# API responde?
curl -s localhost:8020/api/health
curl -s localhost:8020/api/db-status       # backend postgres conectado + nº de votos

# SPA servida?
curl -s localhost:8020 | head -5           # deve retornar index.html

# Pelo domínio público (fora do server):
#   abrir https://<dominio> → login Google → votar → conferir db-status
```

Logs: `docker compose --env-file config/.env logs -f app`

---

## 4. Operação do bolão

| Ação | Como |
|---|---|
| Zerar todos os votos | `POST /api/delete {"nickname":"all"}` com token de admin |
| Definir vencedores | `POST /api/winners` com token de admin (JSON `{categoria: jogo}`) |
| Mostrar/esconder resultados | `POST /api/toggle-results` com token de admin |
| Backup dos dados | `docker exec postgres-goty pg_dump -U kozato postgres > backup.sql` |
| Backup config/vencedores | copiar `backend/data/*.json` |

---

## 5. Notas técnicas

- **gunicorn com 4 workers**: rate limit (10/min) é por worker — efetivo ~40/min.
  Aceitável para bolão; se precisar de limite exato, reduzir `-w 1`.
- **Votos persistentes**: Postgres no volume `pgdata_goty`; config/winners em
  `./backend/data` (montado no container).
- **SPA + API mesma origem**: em produção não há CORS cruzado; `CORS_ORIGINS`
  só importa se acessar a API de outra origem.
- **Nunca versionar**: `config/.env`, `backend/data/usuarios.csv`, chaves JSON.
