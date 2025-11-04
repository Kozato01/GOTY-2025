# TGA 2025 GOAT Vote

Uma aplicação web para amigos votarem em suas escolhas para The Game Awards 2025, inspirada no design oficial do TGA.

## 📁 Estrutura do Projeto

```
📁 backend/           # API Flask (Python)
   ├── app.py         # Servidor principal
   ├── requirements.txt
   └── 📁 data/       # Dados dos votos (CSV)

📁 frontend/          # Interface React (TypeScript)
   ├── package.json
   ├── vite.config.ts
   └── 📁 components/ # Componentes React

📁 docker/            # Configuração Docker
   ├── Dockerfile
   └── docker-compose.yml

📁 docs/              # Documentação
📁 config/            # Arquivos de configuração
```

## 🚀 Como Executar

### Controle de Resultados

Você pode controlar a visibilidade da página de resultados através de variáveis de ambiente:

**Para desenvolvimento:**
```bash
# Mostrar resultados
echo "VITE_SHOW_RESULTS=true" > frontend/.env

# Ocultar resultados  
echo "VITE_SHOW_RESULTS=false" > frontend/.env
```

**Para Docker:**
```bash
# Mostrar resultados
echo "SHOW_RESULTS=true" > docker/.env

# Ocultar resultados
echo "SHOW_RESULTS=false" > docker/.env
```

### Desenvolvimento Separado (Recomendado)

**Backend:**
```bash
cd backend/
python app.py
```

**Frontend:**
```bash
cd frontend/
npm install
npm run dev
```

### Usando NPM Scripts

**Backend + Frontend em um comando:**
```bash
cd frontend/
npm run backend &  # Inicia backend em background
npm run dev        # Inicia frontend
```

### Docker
```bash
cd docker/
docker-compose up --build
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 📝 API Endpoints

### GET /api/votes
Retorna todos os votos salvos.

### POST /api/vote
Salva um novo voto.
```json
{
  "nickname": "usuario",
  "votes": {
    "Jogo do Ano": "Astro Bot",
    "Melhor RPG": "Final Fantasy VII Rebirth"
  }
}
```

### POST /api/delete
Deleta votos de um usuário específico.
```json
{
  "nickname": "usuario"  // ou "all" para deletar todos
}
```

### GET /api/config
Retorna configurações da aplicação (incluindo visibilidade dos resultados).
```json
{
  "status": "success",
  "config": {
    "showResults": true
  }
}
```

## 🛠️ Tecnologias

- **Backend:** Python, Flask, CSV
- **Frontend:** React, TypeScript, Vite
- **Estilo:** CSS puro inspirado no TGA
- **Docker:** Para containerização

## 📚 Documentação Adicional

Consulte a pasta `docs/` para documentação mais detalhada sobre:
- API endpoints
- Configuração Docker
- Guia completo do Full Stack

## 💡 Dica Rápida

Para iniciar tudo rapidamente, abra dois terminais:

**Terminal 1 (Backend):**
```bash
cd backend && python app.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Acesse: http://localhost:3000