# 🎮 TGA 2025 GOAT VOTE - Full Stack

Sistema completo de votação para The Game Awards 2025 com frontend React e backend Python Flask.

## 🚀 Como Rodar o Sistema Completo

### Opção 1: Script Automático (Recomendado)
```powershell
npm run fullstack
```

### Opção 2: Manualmente
1. **Terminal 1** - Backend:
```bash
python app.py
```

2. **Terminal 2** - Frontend:
```bash
npm run dev
```

## 🔗 URLs do Sistema

- **Frontend (React)**: http://localhost:5173
- **Backend (Flask)**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📡 Endpoints da API

### POST /api/vote
Salva um novo voto
```json
{
  "nickname": "NomeDoJogador",
  "timestamp": "2024-10-27T10:00:00.000Z",
  "votes": {
    "Jogo do Ano": "Astro Bot",
    "Melhor RPG": "Metaphor ReFantazio"
  }
}
```

### GET /api/votes
Retorna todos os votos salvos
```json
[
  {
    "nickname": "NomeDoJogador",
    "timestamp": "2024-10-27T10:00:00.000Z",
    "votes": {
      "Jogo do Ano": "Astro Bot",
      "Melhor RPG": "Metaphor ReFantazio"
    }
  }
]
```

### GET /api/health
Verifica se a API está funcionando
```json
{
  "status": "API funcionando!",
  "timestamp": "2025-11-03T17:00:00.000Z"
}
```

## 💾 Armazenamento de Dados

Os votos são salvos no arquivo `usuarios.csv` com a seguinte estrutura:
- **Nickname**: Nome do usuário
- **Timestamp**: Data/hora do voto
- **25 Categorias TGA**: Uma coluna para cada categoria

## 🔧 Funcionalidades

### Frontend (React + TypeScript)
- ✅ Interface de votação interativa
- ✅ Sistema de navegação entre telas
- ✅ Validação de nicknames únicos
- ✅ Exibição de resultados em tempo real
- ✅ Loading states e tratamento de erros
- ✅ Design responsivo

### Backend (Python Flask)
- ✅ API REST para votos
- ✅ Salvamento em CSV
- ✅ CORS habilitado
- ✅ Validação de dados
- ✅ Tratamento de erros

### Integração Full Stack
- ✅ Comunicação Frontend ↔ Backend
- ✅ Sincronização automática de dados
- ✅ Estados de loading
- ✅ Tratamento de erros de conexão

## 📋 Categorias TGA 2025

O sistema suporta todas as 25 categorias oficiais:

1. **Jogo do Ano** (10 pontos)
2. **Melhor Direção de Jogo** (5 pontos)
3. **Melhor Narrativa** (5 pontos)
4. **Melhor Direção de Arte** (5 pontos)
5. **Melhor Trilha Sonora** (5 pontos)
6. **Melhor Design de Áudio** (5 pontos)
7. **Melhor Atuação** (5 pontos)
8. **Inovação em Acessibilidade** (5 pontos)
9. **Jogos com Maior Impacto Social** (5 pontos)
10. **Melhor Jogo Contínuo** (5 pontos)
11. **Melhor Suporte à Comunidade** (3 pontos)
12. **Melhor Jogo Independente** (3 pontos)
13. **Melhor Estreia de um Estúdio Indie** (3 pontos)
14. **Melhor Jogo Mobile** (3 pontos)
15. **Melhor VR / AR** (3 pontos)
16. **Melhor Jogo de Ação** (3 pontos)
17. **Melhor Jogo de Ação / Aventura** (3 pontos)
18. **Melhor RPG** (3 pontos)
19. **Melhor Jogo de Luta** (3 pontos)
20. **Melhor Jogo para Família** (3 pontos)
21. **Melhor Jogo de Simulação / Estratégia** (2 pontos)
22. **Melhor Jogo de Esporte / Corrida** (2 pontos)
23. **Melhor Jogo Multiplayer** (2 pontos)
24. **Melhor Adaptação** (2 pontos)
25. **Jogo Mais Aguardado de 2025** (2 pontos)

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 19.2.0
- TypeScript
- Vite
- Tailwind CSS (via classes inline)

### Backend
- Python 3.14
- Flask 3.0.0
- Flask-CORS 4.0.0

## 📝 Estrutura de Arquivos

```
tga-2025-goat-vote/
├── 📁 components/          # Componentes React
├── 📁 services/           # Serviços de API
├── 📄 app.py             # Servidor Flask
├── 📄 App.tsx            # Componente principal React
├── 📄 constants.ts       # Categorias e configurações
├── 📄 types.ts           # Tipos TypeScript
├── 📄 usuarios.csv       # Dados dos votos
├── 📄 requirements.txt   # Dependências Python
├── 📄 package.json       # Dependências Node.js
└── 📄 start-fullstack.ps1 # Script de inicialização
```

## 🚨 Solução de Problemas

### Backend não inicia
- Verifique se o Python está instalado
- Instale as dependências: `pip install -r requirements.txt`

### Frontend não conecta com Backend
- Certifique-se de que o Flask está rodando em http://localhost:5000
- Verifique se não há firewall bloqueando a porta 5000

### Erro de CORS
- O Flask já está configurado com CORS habilitado
- Se persistir, verifique se está acessando do localhost correto

---

🎮 **Divirta-se votando no TGA 2025!** 🏆