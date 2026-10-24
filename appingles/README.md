# Level Up English

App para aprender inglês alguns minutos por dia: trilha de lições, vidas, ofensiva, mascotes (Bolota, Mia e Capi), desafios com amigos, ranking e uma professora de IA.

## Como está organizado
- `public/` — o site pronto (é isto que vai para o ar). Funciona como app instalável no celular.
- `app-src/` — código do app (o mesmo da versão no Claude).
- `platform.js` — liga o app ao Supabase (login, progresso, ranking, amigos e IA).
- `build.py` — gera a pasta `public/` a partir de `app-src/` (`python3 build.py`).
- `server.js` — servidor simples usado pelo Render.

## Supabase
- Projeto `level-up-english` (São Paulo). Os dados ficam na tabela `docs`, protegida por regras de acesso por aluno.
- A primeira conta criada vira administradora.
- Professora de IA: Edge Function `tutor`. Para ligar, crie o segredo `ANTHROPIC_API_KEY` em Supabase → Edge Functions → Secrets. Limite diário por aluno: segredo `AI_DAILY_LIMIT` (padrão 60).
