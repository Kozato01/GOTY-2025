---
version: 1
slug: "frontend-app-tsx"
primary_target: "frontend/App.tsx"
related_targets: ["frontend/components/IntroScreen.tsx","frontend/components/VotingScreen.tsx","frontend/components/WinnersScreen.tsx","frontend/components/Header.tsx"]
---

# Superfície: app GOTY VOTE 2026 (Home, Votação, Ganhadores, shell)

Modo: Operate (Home e Ganhadores com momento de cerimônia). Público: amigos, celular e PC meio a meio. Régua de acabamento: site do The Game Awards (só o nível de acabamento; a marca dele é proibida, ver PRODUCT.md).

## Direction contract

THESIS: Noite de gala entre amigos, com palco preto, ouro escovado e um único holofote. Recusa o HUD esports ciano-sobre-preto (grid, cantoneiras, neon, chanfros) que o app usava.

OWN-WORLD: Fundo #0b0b0c com holofote quente (#3a3020) vindo do topo. Ouro #c9a24a (claro #f0d58a, escuro #7a5c22) usado em fios de 1px, números e ação primária. Texto marfim #f4f1ea, secundário #a49d8e, superfícies #141312 com borda #2a2620. Uma família só, Archivo: larga e pesada no display, normal na interface. Cantos de 2px. Troféu é uma taça SVG própria em ouro escovado sobre base preta com faixa dourada.

STORY: A pessoa abre, vê o troféu e a contagem regressiva, entra com o Google, vota categoria por categoria, revisa a cédula inteira, confirma e recebe o carimbo de "voto registrado". Depois da cerimônia, abre Ganhadores e vê o Jogo do Ano revelado em destaque.

FIRST VIEWPORT: Barra fina no topo com a marca GOTY VOTE 2026 à esquerda e a navegação em caixa alta espaçada à direita. No centro, sob o holofote, o troféu (~180px), "GOTY VOTE 2026" em display (até 6rem, com 2026 em ouro), a linha "Bolão entre amigos · The Game Awards · 11 de dezembro", quatro células de contagem com fio dourado e o login/CTA logo abaixo. Os números aparecem numa linha discreta separada por fios, não em cards.

FORM: canon (padrão da categoria: gala preto e dourado), escolhido pelo usuário como saída padrão. seed:fa613bc8922eb152. Movimento assinatura: o holofote acende na entrada do troféu e, nos ganhadores, o Jogo do Ano é revelado sob o holofote.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
