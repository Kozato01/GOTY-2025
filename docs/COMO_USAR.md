# 🎮 TGA 2025 GOAT VOTE - Sistema Completo

Agora você tem **3 maneiras** de rodar o sistema:

## 🚀 Opção 1: Docker (RECOMENDADO - Tudo em um)
```bash
# Build e executa em um comando
docker-compose up --build

# Ou use o script
docker-run.bat
```
**URL**: http://localhost:8080

## 💻 Opção 2: Desenvolvimento Separado
```bash
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend  
npm run dev
```
**URLs**: 
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## ⚡ Opção 3: Script Full Stack
```bash
npm run fullstack
```

---

## 🐳 Docker: A Solução Completa

### Por que usar Docker?
✅ **Tudo em um só lugar**: Frontend + Backend + Dados
✅ **Fácil deploy**: Funciona em qualquer máquina com Docker
✅ **Dados persistentes**: Votos salvos fora do container
✅ **Pronto para produção**: Otimizado e configurado

### Como funciona?
1. **Build automático**: React é buildado dentro do Docker
2. **Servidor único**: Flask serve tanto API quanto arquivos React
3. **Porta única**: Tudo em http://localhost:8080
4. **Dados seguros**: CSV salvo em `./data/` no host

### Comandos essenciais:
```bash
# Rodar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart
```

---

## 📊 Resumo das Portas

| Modo | Frontend | Backend | Descrição |
|------|----------|---------|-----------|
| **Docker** | 8080 | 8080 | Tudo integrado |
| **Desenvolvimento** | 5173 | 5000 | Separado |
| **Full Stack Script** | 5173 | 5000 | Separado |

---

## 🎯 Escolha sua Opção:

### 🥇 Para usar o sistema: **Docker**
- Mais simples
- Uma só porta
- Pronto para produção

### 🥈 Para desenvolver: **Desenvolvimento Separado**
- Hot reload no frontend
- Debug fácil no backend
- Desenvolvimento ativo

### 🥉 Para testar rápido: **Full Stack Script**
- Inicia tudo automaticamente
- Desenvolvimento rápido

---

**🚀 Recomendação: Use `docker-compose up --build` e acesse http://localhost:8080**