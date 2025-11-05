# Multi-stage Dockerfile para TGA 2025 GOAT Vote
# Stage 1: Build do frontend React
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Instala dependências de build para Alpine
RUN apk add --no-cache python3 make g++

# Copia arquivos de dependências do frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Instala dependências
RUN npm install

# Copia código fonte do frontend
COPY frontend/ .

# Build do frontend
RUN npm run build

# Stage 2: Servidor Python Flask + frontend buildado
FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema (curl não é mais necessário sem health check)
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e instala dependências Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o backend (incluindo a pasta data)
COPY backend/ ./

# Copia os arquivos buildados do React
COPY --from=frontend-builder /app/dist ./static

# Garante que a pasta data existe (já deve existir pelo COPY acima)
RUN mkdir -p data

# Se o arquivo CSV não existir, cria um inicial
RUN if [ ! -f ./data/usuarios.csv ]; then \
    echo "nickname,categoria,opcao,pontos,timestamp" > ./data/usuarios.csv; \
    fi

# Variáveis de ambiente
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=8080

# Expõe a porta
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["python", "app.py"]