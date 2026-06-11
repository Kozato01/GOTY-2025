#!/bin/bash
# Script para build e execução do Docker
# Rodar de dentro da pasta docker/

set -e

ENV_FILE="../config/.env"

echo "🐳 GOTY VOTE 2026 - Docker Build & Run"
echo "======================================"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE não encontrado."
    echo "   Copie config/.env.example para config/.env e preencha as variáveis."
    exit 1
fi

# Build da imagem (o --env-file alimenta VITE_GOOGLE_CLIENT_ID no build)
echo "📦 Building Docker image..."
docker compose --env-file "$ENV_FILE" build

# Executa o container
echo "🚀 Starting container..."
docker compose --env-file "$ENV_FILE" up -d

echo ""
echo "✅ Container iniciado com sucesso!"
echo "🌐 Aplicação disponível em: http://localhost:8080"
echo ""
echo "📊 Comandos úteis:"
echo "   docker compose logs -f    # Ver logs"
echo "   docker compose stop       # Parar container"
echo "   docker compose down       # Parar e remover container"
echo "   docker compose restart    # Reiniciar container"
