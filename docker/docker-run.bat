@echo off
REM Script para build e execução do Docker no Windows
REM Rodar de dentro da pasta docker\

set ENV_FILE=..\config\.env

echo 🐳 GOTY VOTE 2026 - Docker Build ^& Run
echo ======================================

if not exist "%ENV_FILE%" (
    echo ❌ %ENV_FILE% nao encontrado.
    echo    Copie config\.env.example para config\.env e preencha as variaveis.
    exit /b 1
)

REM Build da imagem (o --env-file alimenta VITE_GOOGLE_CLIENT_ID no build)
echo 📦 Building Docker image...
docker compose --env-file "%ENV_FILE%" build
if errorlevel 1 exit /b 1

REM Executa o container
echo 🚀 Starting container...
docker compose --env-file "%ENV_FILE%" up -d
if errorlevel 1 exit /b 1

echo.
echo ✅ Container iniciado com sucesso!
echo 🌐 Aplicacao disponivel em: http://localhost:8080
echo.
echo 📊 Comandos uteis:
echo    docker compose logs -f    # Ver logs
echo    docker compose stop       # Parar container
echo    docker compose down       # Parar e remover container
echo    docker compose restart    # Reiniciar container
