# Política de Privacidade — GOTY Vote 2026

_Última atualização: 10 de junho de 2026_

Este documento descreve, em conformidade com a **LGPD (Lei nº 13.709/2018)**, como o GOTY Vote 2026 (bolão entre amigos do The Game Awards) trata os dados dos participantes.

## O que é coletado

| Dado | Onde fica | Finalidade |
|------|-----------|------------|
| Login Google (ID Token) | **Apenas em memória**, durante a sessão | Garantir **1 voto por pessoa** |
| `voter_id` (hash irreversível do e-mail) | Banco de dados | Identidade anônima do voto (anti-duplicação) |
| Nickname (digitado por você) | Banco de dados | Exibição nos resultados e ranking |
| Votos e data/hora | Banco de dados | Apuração do bolão |

## O que NÃO é coletado nem armazenado

- **E-mail** — usado somente em memória, no instante da validação do token, para gerar o `voter_id` (HMAC-SHA256 com segredo exclusivo do servidor). É **impossível** reverter o hash para o e-mail sem esse segredo.
- Nome real, foto de perfil, endereço IP.
- Cookies de rastreamento, analytics ou qualquer dado de terceiros além do necessário para o login Google.

## Base legal

**Consentimento** (art. 7º, I da LGPD): antes de votar, você marca um checkbox autorizando o uso do login Google exclusivamente para garantir voto único.

## Seus direitos

- **Acesso** — você pode consultar seu próprio voto a qualquer momento (basta logar novamente).
- **Exclusão** — você pode apagar seu voto definitivamente pelo próprio app (endpoint `DELETE /api/me`). A exclusão é imediata e irreversível.

## Retenção

Os votos existem apenas para a apuração do bolão. **Toda a base é apagada após o encerramento do evento** (The Game Awards, 11 de dezembro de 2026, com apuração até o fim do mês).

## Controlador e contato

Projeto pessoal sem fins lucrativos, mantido por **Kozato01** ([github.com/Kozato01](https://github.com/Kozato01)). Dúvidas ou solicitações sobre seus dados: abra uma issue no repositório do projeto.
