# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Grupo de amigos fazendo um bolão do The Game Awards 2026. Usam celular e PC na mesma proporção: votam antes da cerimônia e voltam para ver ranking e ganhadores.

## Product Purpose
Cada pessoa escolhe um indicado por categoria antes da cerimônia (11/12/2026). Depois, os votos são comparados com os vencedores reais, com pesos em pontos por categoria, e gera-se um ranking. O sucesso é todo mundo votar sem atrito e o ranking virar assunto do grupo.

## Operating Context
- Login Google garante 1 voto por pessoa. O e-mail não é armazenado (LGPD), e o nickname serve só para exibição.
- Quem já votou pode ver os resultados ou refazer o voto (o voto antigo é apagado).
- As categorias e os indicados vêm de `backend/data/categories.json` via `/api/categories`, e os ganhadores vêm de `/api/winners`.
- Telas: Intro (countdown, stats, login), Votação (passo a passo por categoria), Resultados, Categorias, Participantes, Ganhadores e Privacidade.

## Capabilities and Constraints
- React 19 + Vite + Tailwind via CDN (configurado em `frontend/index.html`). Backend Flask serve o build em `backend/static`.
- Antes de enviar o voto deve haver uma revisão final (pedido confirmado).
- Os troféus pequenos são o SVG próprio (`GoldTrophy`). O logo e a foto da estatueta do TGA ficam em `frontend/public/brand/`.

## Brand Commitments
- Nome: "GOTY VOTE 2026". Copy em português do Brasil, com tom de bolão entre amigos.
- Decisão do usuário (17/11/2026): usar o logo oficial do The Game Awards (Wikimedia, recolorido para o dourado do tema) e a foto da estatueta. O bolão é privado entre amigos e as marcas são do TGA.

## Evidence on Hand
- As capas dos jogos vêm dos `imageUrl` das categorias. Não há depoimentos nem números além dos dados reais da API.

## Product Principles
1. Votar precisa ser rápido no celular e no PC.
2. O voto é um compromisso: a pessoa revisa antes e vê confirmação clara depois.
3. A tela de ganhadores é uma celebração e deve funcionar como momento de revelação.
