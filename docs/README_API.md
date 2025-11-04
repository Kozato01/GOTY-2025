# API de Votação TGA - Backend Python

Este é o backend em Python Flask para a aplicação de votação TGA 2025.

## Funcionalidades

- **POST /api/vote**: Salva um novo voto no arquivo usuarios.csv
- **GET /api/votes**: Retorna todos os votos salvos
- **GET /api/health**: Verifica se a API está funcionando

## Instalação

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Execute o servidor:
```bash
python app.py
```

O servidor estará disponível em `http://localhost:5000`

## Uso da API

### Salvar um voto (POST /api/vote)

```bash
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "NomeDoJogador",
    "timestamp": "2024-10-27T10:00:00.000Z",
    "votes": {
      "Jogo do Ano": "Astro Bot",
      "Melhor RPG": "Metaphor ReFantazio"
    }
  }'
```

### Obter todos os votos (GET /api/votes)

```bash
curl http://localhost:5000/api/votes
```

### Verificar saúde da API (GET /api/health)

```bash
curl http://localhost:5000/api/health
```

## Estrutura do arquivo CSV

O arquivo `usuarios.csv` é criado automaticamente com os seguintes cabeçalhos:

- Nickname
- Timestamp
- Jogo do Ano
- Melhor Direção de Jogo
- Melhor Narrativa
- (... todas as 25 categorias do TGA)

## Categorias Suportadas

O backend suporta todas as 25 categorias do TGA 2025:

1. Jogo do Ano
2. Melhor Direção de Jogo
3. Melhor Narrativa
4. Melhor Direção de Arte
5. Melhor Trilha Sonora
6. Melhor Design de Áudio
7. Melhor Atuação
8. Inovação em Acessibilidade
9. Jogos com Maior Impacto Social
10. Melhor Jogo Contínuo
11. Melhor Suporte à Comunidade
12. Melhor Jogo Independente
13. Melhor Estreia de um Estúdio Indie
14. Melhor Jogo Mobile
15. Melhor VR / AR
16. Melhor Jogo de Ação
17. Melhor Jogo de Ação / Aventura
18. Melhor RPG
19. Melhor Jogo de Luta
20. Melhor Jogo para Família
21. Melhor Jogo de Simulação / Estratégia
22. Melhor Jogo de Esporte / Corrida
23. Melhor Jogo Multiplayer
24. Melhor Adaptação
25. Jogo Mais Aguardado de 2025

## CORS

O backend está configurado com CORS habilitado para permitir requisições do frontend React.