# Lucifer — Caça às Fraternidades

Novo arcade 32 bits do site Skulls. Os 20 carros de fraternidades são apresentados em sprites no mapa. As setas movem a mira e ESPAÇO lança a Molotov fictícia. Cada carro atingido rende 10 pontos; combos concedem +1 a +6 segundos por acerto, com 2 minutos iniciais por partida.

## Ranking global

A API /api/lucifer-leaderboard usa o banco Redis da integração Vercel via a variável de ambiente REDIS_URL. Também oferece compatibilidade com Upstash REST caso as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN sejam configuradas. Credenciais não devem ser publicadas neste repositório. Os resultados usam sessões assinadas, validação básica de tempo e bloqueio de reenvios. Anti-fraude absoluto não é oferecido enquanto a jogabilidade for calculada no navegador.

## Desenvolvimento

Execute npm run check para validar código e endpoints (o build gera public/ a partir de web/). Em modo local, /api/lucifer-leaderboard passa pelo server/local-app.js. Se nenhum Redis estiver conectado, o placar é mantido somente no navegador.
