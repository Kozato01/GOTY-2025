#!/bin/bash
# Script para build e execução do Docker

echo "🐳 TGA 2025 GOAT VOTE - Docker Build & Run"
echo "=========================================="

# Build da imagem
echo "📦 Building Docker image..."
docker-compose build

# Executa o container
echo "🚀 Starting container..."
docker-compose up -d

echo ""
echo "✅ Container iniciado com sucesso!"
echo "🌐 Aplicação disponível em: http://localhost:8080"
echo ""
echo "📊 Comandos úteis:"
echo "   docker-compose logs -f    # Ver logs"
echo "   docker-compose stop       # Parar container"
echo "   docker-compose down       # Parar e remover container"
echo "   docker-compose restart    # Reiniciar container"