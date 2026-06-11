# Multi-stage Dockerfile para GOTY Vote 2026
# Stage 1: Build do frontend React
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Client ID do Google (público por natureza) — necessário no BUILD do frontend.
# Passe via: docker compose --env-file ../config/.env build
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Copia arquivos de dependências do frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Instala dependências
RUN npm ci

# Copia código fonte do frontend
COPY frontend/ .

# Build do frontend (vite.config lê VITE_GOOGLE_CLIENT_ID do ambiente)
RUN npm run build

# Stage 2: Servidor Python Flask (gunicorn) + frontend buildado
FROM python:3.11-slim

WORKDIR /app

# Copia requirements e instala dependências Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o backend (incluindo a pasta data)
# Segredos NÃO entram na imagem: config/.env via env_file e
# credentials/ via volume read-only (ver docker-compose.yml)
COPY backend/ ./

# Copia os arquivos buildados do React
COPY --from=frontend-builder /app/dist ./static

# Garante que a pasta data existe (o CsvRepository cria/repara o CSV sozinho)
RUN mkdir -p data

# Variáveis de ambiente (as demais — DB_BACKEND, GOOGLE_CLIENT_ID,
# VOTER_HASH_SECRET, ADMIN_VOTER_IDS, CORS_ORIGINS — vêm do env_file)
ENV FLASK_ENV=production
ENV PORT=8080

# Expõe a porta
EXPOSE 8080

# Produção: gunicorn (sem servidor de dev do Flask)
CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT:-8080} --access-logfile - app:app"]
