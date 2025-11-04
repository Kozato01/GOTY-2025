# 🐳 TGA 2025 GOAT VOTE - Docker Full Stack

Sistema completo dockerizado para votação The Game Awards 2025. Frontend React + Backend Flask em um único container.

## 🚀 Quick Start

### Pré-requisitos
- Docker instalado
- Docker Compose instalado

### Rodar com um comando
```bash
# Windows
docker-run.bat

# Linux/Mac
./docker-run.sh
```

Ou manualmente:
```bash
docker-compose up --build -d
```

### Acessar a aplicação
- **URL**: http://localhost:8080
- **API**: http://localhost:8080/api/health

## 🏗️ Arquitetura Docker

### Multi-Stage Build
1. **Stage 1**: Build do frontend React com Node.js
2. **Stage 2**: Servidor Flask servindo API + arquivos estáticos do React

### Estrutura do Container
```
/app/
├── app.py              # Servidor Flask
├── static/             # Arquivos do React buildados
├── data/               # Dados persistentes (CSV)
└── requirements.txt    # Dependências Python
```

## 📦 Docker Compose

```yaml
services:
  tga-vote:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data  # Persiste dados fora do container
    environment:
      - FLASK_ENV=production
```

## 💾 Persistência de Dados

Os votos são salvos em `./data/usuarios.csv` no host, garantindo que os dados não sejam perdidos quando o container for recriado.

## 🔧 Comandos Docker

### Build e Run
```bash
docker-compose up --build -d    # Build e executa em background
docker-compose up --build       # Build e executa com logs
```

### Gerenciamento
```bash
docker-compose logs -f          # Ver logs em tempo real
docker-compose stop             # Parar container
docker-compose start            # Iniciar container parado
docker-compose restart          # Reiniciar container
docker-compose down             # Parar e remover container
```

### Debug
```bash
docker-compose exec tga-vote bash    # Entrar no container
docker-compose logs tga-vote         # Ver logs específicos
```

## 🌐 URLs e Endpoints

### Frontend
- **Home**: http://localhost:8080
- **Todas as rotas do React são servidas pelo Flask**

### API Backend
- **Health Check**: http://localhost:8080/api/health
- **Salvar Voto**: POST http://localhost:8080/api/vote
- **Obter Votos**: GET http://localhost:8080/api/votes

## 🔄 Desenvolvimento vs Produção

### Modo Desenvolvimento (atual setup)
- Frontend React servido pelo Vite (npm run dev)
- Backend Flask separado (python app.py)
- CORS habilitado para localhost:5173

### Modo Produção (Docker)
- Frontend React buildado e servido pelo Flask
- API e arquivos estáticos na mesma porta (8080)
- Otimizado para performance

## 📂 Estrutura de Arquivos

```
tga-2025-goat-vote/
├── 🐳 Dockerfile              # Multi-stage build
├── 🐳 docker-compose.yml      # Configuração Docker Compose
├── 🐳 .dockerignore          # Arquivos ignorados no build
├── 🐳 docker-run.bat         # Script Windows
├── 🐳 docker-run.sh          # Script Linux/Mac
├── 📁 data/                  # Dados persistentes
│   └── usuarios.csv          # Votos salvos
├── 📁 static/                # Arquivos React buildados (gerado)
├── 🐍 app.py                 # Servidor Flask
├── ⚛️ App.tsx                # Frontend React
├── 📝 package.json           # Dependências Node.js
└── 📝 requirements.txt       # Dependências Python
```

## 🚨 Troubleshooting

### Container não inicia
```bash
docker-compose logs tga-vote    # Ver erros
docker-compose down             # Remover container
docker-compose up --build      # Rebuild completo
```

### Dados não persistem
- Verifique se a pasta `./data` existe no host
- Verifique permissões da pasta

### API não responde
- Teste: `curl http://localhost:8080/api/health`
- Verifique logs: `docker-compose logs tga-vote`

### Frontend não carrega
- Verifique se o build do React foi bem-sucedido nos logs
- Teste acesso direto: http://localhost:8080

## 🎮 Features Completas

✅ **Frontend React**
- Interface de votação completa
- Navegação entre telas
- Estados de loading
- Tratamento de erros

✅ **Backend Flask**
- API REST para votos
- Servir arquivos estáticos
- Persistência em CSV
- CORS configurado

✅ **Docker Integration**
- Build automatizado
- Dados persistentes
- Configuração para produção
- Scripts de conveniência

---

🎮 **Acesse http://localhost:8080 e comece a votar!** 🏆