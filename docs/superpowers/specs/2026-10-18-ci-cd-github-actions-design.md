# CI/CD com GitHub Actions — Design

**Data:** 2026-10-18 · **Status:** aprovado no chat pelo Guilherme

## Objetivo

Tirar da mão do Guilherme três tarefas repetitivas, nos dois repositórios do SIGRH:

1. **Checar se nada quebrou:** build, lint e testes rodam sozinhos em todo PR.
2. **Deploy da API no Render:** dispara sozinho no merge para `main`, e só se o CI passar.
3. **Seeder no Neon:** um botão manual no GitHub, com confirmação digitada.

Sucesso: abrir um PR mostra checks verdes ou vermelhos nos dois repos; o merge no `main` da API coloca a versão nova no ar sem ninguém abrir o painel do Render; o seed de produção é feito pelo GitHub, sem `.env` local apontando para o Neon.

## Situação atual (2026-10-18)

| | Front (`Guiezz/regioes-hidrograficas-front`) | API (`Guiezz/regioes-hidrograficas-api`) |
|---|---|---|
| Hospedagem | Vercel, integração Git (Preview por PR, Produção no `main`) | Render (`https://regioes-hidrograficas-api.onrender.com`), Docker |
| Banco | — | Neon (Postgres), via `DATABASE_URL` |
| Fluxo de branch | `feature → dev → main` | `feature → main` |
| Workflows | nenhum | nenhum |
| Estado | `tsc` ok, `next build` ok sem API, **1 erro de lint** (`src/app/indicadores/page.tsx:31`, `no-explicit-any`) | `go vet`, `go build`, `go test ./...` ok |

## Decisões

- **Vercel continua como está.** O CI do front só valida; não substitui o deploy da Vercel.
- **O que trava produção é a proteção de branch:** merge em `main` (os dois repos) e `dev` (front) exige os checks de CI verdes. Como a Vercel só publica produção a partir do `main`, isso também segura o front.
- **Deploy da API pela API REST do Render** (não por deploy hook), porque permite fixar o commit e acompanhar o status até `live`. O auto-deploy do Render é desligado pelo Guilherme.
- **Seeder só manual** (`workflow_dispatch`) com input de confirmação `SEED`. Nunca roda automaticamente: ele apaga e recria todas as tabelas.
- **Lint do front entra bloqueando**, e o erro existente é corrigido neste trabalho.
- Secrets de produção ficam no **environment `production`** do repositório da API; só os jobs de deploy e seed o usam.

## Design

### API — `.github/workflows/ci-cd.yml`

Gatilhos: `pull_request` (qualquer base) e `push` em `main`.

- Job `test` — "Go: vet, build e testes": `actions/setup-go` com `go-version-file: go.mod` e cache; `go vet ./...`, `go build ./...`, `go test ./...`.
- Job `docker` — "Docker build": `docker build .` (sem push), para garantir que a imagem que o Render constrói continua compilando.
- Job `deploy` — "Deploy no Render": `needs: [test, docker]`, roda só em `push` no `main`, `environment: production`, `concurrency: deploy-production` (sem cancelar o que está em andamento).
  1. `POST https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys` com `{"commitId": "<github.sha>"}`.
  2. Acompanha `GET /v1/services/$RENDER_SERVICE_ID/deploys/<id>` a cada 15 s, por até 20 min: `live` → sucesso; `build_failed`, `update_failed`, `canceled`, `deactivated`, `pre_deploy_failed` → falha com o status na mensagem.
  3. Teste de fumaça: `GET https://regioes-hidrograficas-api.onrender.com/api/v1/basins` precisa responder 200 com uma lista não vazia, com novas tentativas por até 5 min (o Render pode estar acordando).
  4. Escreve no `GITHUB_STEP_SUMMARY`: commit, id do deploy, status e resultado do teste de fumaça.

### API — `.github/workflows/seed.yml`

Gatilho: só `workflow_dispatch`, com o input obrigatório `confirmacao` (texto).

- Job `seed` — "Seed do banco de produção (Neon)": `environment: production`, `concurrency: seed-production`.
  1. Falha logo no início se `confirmacao` for diferente de `SEED`, sem tocar no banco.
  2. Roda `go run ./cmd/seeder` com `DATABASE_URL` vindo do secret `NEON_DATABASE_URL`, salvando a saída em arquivo.
  3. Falha se a saída contiver `❌`: o seeder registra erros por bacia com `log.Printf` e termina com código 0, então o código de saída sozinho não basta.
  4. Conta as linhas de cada tabela do schema `public` com `psql` (já vem no runner Ubuntu) e escreve a tabela no `GITHUB_STEP_SUMMARY`.
  5. O valor do secret nunca aparece no log (o mascaramento do GitHub cobre isso, e nenhum passo pode imprimir a URL).

### Front — `.github/workflows/ci.yml`

Gatilhos: `pull_request` e `push` em `dev` e `main`.

- Job `check` — "Typecheck, lint e build": `actions/setup-node` com Node 24 e cache npm; `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm run build` com `NEXT_PUBLIC_API_URL=https://regioes-hidrograficas-api.onrender.com/api/v1` (o build não chama a API, mas a variável fica coerente com produção).
- Antes do workflow: corrigir o `any` em `src/app/indicadores/page.tsx:31` com o tipo correto, sem `eslint-disable`.

### Proteção de branch (depois do primeiro run verde)

- API, `main`: checks obrigatórios `Go: vet, build e testes` e `Docker build`.
- Front, `dev` e `main`: check obrigatório `Typecheck, lint e build`.
- Aplicada pelo orquestrador via `gh api` **só com o OK do Guilherme**. Sem exigir review (ele trabalha sozinho) e sem bloquear o admin.

### Fica com o Guilherme

1. Criar a API key do Render (Account Settings → API Keys) e pegar o service ID (`srv-…`, aparece na URL do serviço).
2. Na API, criar o environment `production` com os secrets `RENDER_API_KEY`, `RENDER_SERVICE_ID` e `NEON_DATABASE_URL`.
3. Desligar o Auto-Deploy no Render (Settings → Build & Deploy → Auto-Deploy: Off). Até isso acontecer, cada merge gera dois deploys (o automático e o do Actions).
4. Dar o OK para a proteção de branch.

## Fora do escopo

- Trocar Vercel ou Render, deploy de preview da API, migrations versionadas no lugar do seeder destrutivo, publicar a imagem Docker em registry, notificações (Slack/e-mail).

## Riscos

- **Render free hiberna:** o teste de fumaça tolera até 5 min de cold start.
- **Seed deixa produção vazia durante a execução** (drop → recria → importa). Por isso é manual; o Guilherme escolhe a hora.
- **Formato da API do Render** (campos `id`, `status`): validar no primeiro deploy real; o job falha com a resposta crua no log se o JSON vier diferente.
