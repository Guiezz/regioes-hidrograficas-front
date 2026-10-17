# Estados Honestos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nenhuma página do SIGRH mostra dado inventado, de outra região, errado da importação, ou "sem dados" quando houve falha.

**Architecture:** No back, o seeder deixa de importar linhas inválidas da Matriz (normalizando eixo/prioridade) e deixa de criar medições sem métrica. No front, `api.ts` propaga erros; um hook `useAsyncData` (com descarte de respostas obsoletas) e um componente `DataState` dão às 8 páginas os estados loading/error/empty/unavailable sem desmontar cabeçalho e filtros.

**Tech Stack:** Go 1.25 + Gin + GORM + excelize (API); Next.js 16, React 19, TypeScript, Tailwind v4 (front).

**Spec:** `docs/superpowers/specs/2026-10-16-estados-honestos-design.md` (neste repositório). Leia a spec inteira antes de começar; copy exato e tabelas de resultado esperado estão lá.

## Global Constraints

- Dois repositórios, duas branches, dois PRs independentes:
  - Back: `/Users/guilhermebessa/Projetos/sadgrh/regioes-hidrograficas-api`, branch `fix/importacao-matriz-medicoes` a partir de `main`, PR para `main`. Executor: agente **Back**.
  - Front: `/Users/guilhermebessa/Projetos/sadgrh/regioes-hidrograficas-web`, branch `feat/estados-honestos` (já existe, contém spec e este plano), PR para `dev`. Executor: agente **Prisma**.
- **O seeder (`go run ./cmd/seeder`) DROPA todas as tabelas.** Só rodar contra o banco local: antes de rodar, confirmar que `DATABASE_URL` do `.env` aponta para `localhost`. Nunca descomentar/usar a URL de produção (Neon) do `.env`; nunca imprimir o `.env`.
- Sem dependência nova em nenhum dos dois repositórios (nem biblioteca de fetch, nem framework de teste no front).
- Front não tem testes automatizados: o gate é `npx tsc --noEmit` + `npx eslint <arquivos alterados>` sem erros novos (há 13 erros `no-explicit-any` pré-existentes; não aumentar) + verificação no portal.
- Back: gate é `go test ./cmd/seeder/`, `go build ./...`, `go vet ./...`.
- Copy em pt-BR exatamente como na spec (seções 1.2, 2.2, 3.2, 4.1, 4.3).
- Portais: "SIGRH App" (1440x900) e "SIGRH Mobile" (390x844). Front em :3000, API em :8080 (Docker `regioes_api`), Postgres `regioes_db`. Ao clicar opções de Radix Select pelo portal, se o ref falhar use coordenadas; nunca `click` com ref vazio.
- Commits: trailer `Co-Authored-By:` com o modelo que o executor está rodando (ex.: `Claude Sonnet 5.5 <noreply@anthropic.com>`).

## Review Focus

1. **Troca rápida de região** (selecionar A e logo B) → a página termina com dados de B, nunca de A. *Teste: Task F1 Step 2 (hook) e Task F8 Step 3.*
2. **API fora do ar no carregamento inicial E numa troca de filtro** → `error` com título/filtros visíveis; "Tentar novamente" funciona após religar. *Teste: Task F8 Step 2.*
3. **Matriz com filtro que zera resultados numa região completa** → `empty` com "Limpar filtros", não `unavailable`. *Teste: Task F2 Step 3.*
4. **Seções com número ≥ 10** ("1.10", "3.10") → aparecem só sob o pai correto. *Teste: Task F5 Step 1.*
5. **Reexecutar o seeder duas vezes** → contagens da Matriz iguais (sem duplicar). *Teste: Task B3 Step 2.*

---

## Parte Back (agente Back)

### Task B1: Importação da Matriz

**Files:**
- Create: `cmd/seeder/matriz_normalize.go`, `cmd/seeder/matriz_normalize_test.go`
- Modify: `cmd/seeder/plano_financeiro.go` (`importarMatrizJSON`), `internal/domain/model/ActionMatrix.go`, `internal/api/handler/financeiro.go` (`GetMatriz`)

**Interfaces:**
- Produces: `func normalizeEixoMatriz(raw string) string`, `func normalizePrioridade(raw string) string`; campo `TipoMatrizOriginal string \`json:"tipo_matriz_original"\`` em `model.ActionMatrix`.

- [ ] **Step 1: Testes (falhando)** em `matriz_normalize_test.go`, table-driven:
  - `normalizeEixoMatriz`: "Matriz de ações e programas do eixo de demanda hídrica da RH do Coreaú" → "Eixo Demanda Hídrica"; "Programas e ações do eixo oferta hídrica" → "Eixo Oferta Hídrica"; "Matriz de Ações e Programas do Eixo de Gerenciamento das Águas" → "Eixo Gerenciamento das Águas"; "Matriz de ações e programas do eixo político-institucional" → "Eixo Político-Institucional"; "Matriz de Ações e Programas do Eixo Politico-Institucional" → "Eixo Político-Institucional"; "Matriz de ações e programas do eixo Aspectos Ambientais" → "Eixo Aspectos Ambientais"; "Eixo Demanda Hídrica" → "Eixo Demanda Hídrica"; texto sem palavra-chave → retorna o texto original com `strings.TrimSpace`.
  - `normalizePrioridade`: "Baixo"→"Baixa", "baixa "→"Baixa", "Alta"→"Alta", "Média"→"Média", "media"→"Média", ""→"".
- [ ] **Step 2:** `go test ./cmd/seeder/ -run 'Normalize' -v` → FAIL (funções indefinidas).
- [ ] **Step 3: Implementar** em `matriz_normalize.go`: comparação em minúsculas e sem acento (remover diacríticos com `golang.org/x/text` só se já estiver no `go.mod`; senão, substituição manual dos caracteres á/é/í/ó/ú/â/ê/ô/ã/õ/ç). Palavras-chave e ordem de teste: "demanda", "oferta", "gerenciamento", "politico", "ambient".
- [ ] **Step 4:** `go test ./cmd/seeder/ -run 'Normalize' -v` → PASS.
- [ ] **Step 5: Seeder e API.**
  - `ActionMatrix`: adicionar `TipoMatrizOriginal` (`gorm:"type:text"`).
  - `importarMatrizJSON`: pular linha com `strings.TrimSpace(AcoesEspecificas) == ""`; `TipoMatriz = normalizeEixoMatriz(item.Matriz)`, `TipoMatrizOriginal = item.Matriz`, `Prioridade = normalizePrioridade(item.Prioridade)`; antes do loop `db.Where("basin_id = ?", basinID).Delete(&model.ActionMatrix{})`; inserir com `db.Create` (remover o `FirstOrCreate`). Log: "✅ [Financeiro] %d de %d linhas da matriz importadas (%d sem ação específica ignoradas)".
  - `GetMatriz`: `query.Order("id ASC").Find(...)`.
- [ ] **Step 6:** `go build ./... && go vet ./...` → sem saída de erro.
- [ ] **Step 7: Commit** `fix(seeder): matriz importa so linhas com acao especifica e normaliza eixo e prioridade`.

### Task B2: Medições só com métrica

**Files:**
- Modify: `cmd/seeder/monitoring.go`; Test: `cmd/seeder/matriz_normalize_test.go` (ou `monitoring_test.go`)

**Interfaces:**
- Produces: `func hasMetric(cell string) bool`.

- [ ] **Step 1: Teste (falhando)** `TestHasMetric`: ""→false, "   "→false, "0"→true, "0,5"→true, "1"→true, "50%"→true.
- [ ] **Step 2:** `go test ./cmd/seeder/ -run HasMetric -v` → FAIL.
- [ ] **Step 3:** implementar `hasMetric` (célula não vazia após `TrimSpace`). Em `seedMonitoring`, ler `rawMetrica := safeGet(row, 8)`; criar o `model.Measurement` e adicioná-lo a `createdMeasurements` **somente se** `hasMetric(rawMetrica)`. Ação, acumuladores e cálculo de IEA relativo inalterados.
- [ ] **Step 4:** `go test ./cmd/seeder/ -v && go build ./... && go vet ./...` → PASS / sem erros.
- [ ] **Step 5: Commit** `fix(seeder): so cria medicao quando a planilha tem metrica de execucao`.

### Task B3: Reimportar, conferir e abrir PR

- [ ] **Step 1:** confirmar `DATABASE_URL` local (ver Global Constraints), rodar `go run ./cmd/seeder` e depois `docker compose up -d --build api`.
- [ ] **Step 2: Conferir** (rodar o seeder uma segunda vez e repetir a conferência — contagens idênticas):
  - `curl -s "localhost:8080/api/v1/financeiro/matriz?basin_id=N"` → contagens: 5→99, 4→60, 6→74, 7→60, 8→83, 11→91; 1, 2, 3, 9, 10 → 0. Em todas as linhas: `acoes_especificas` não vazia, `prioridade` ∈ {Alta, Média, Baixa}, `tipo_matriz` ∈ 5 eixos. Ordem por `id` crescente.
  - `curl -s "localhost:8080/api/v1/actions?basin_id=9"` → 107 ações, todas com `measurements: []`; repetir para basin 5 (nenhuma com medição).
- [ ] **Step 3:** `git push -u origin fix/importacao-matriz-medicoes` e `gh pr create --base main` com resumo (regras, campo `tipo_matriz_original`, contagens conferidas, aviso de que o seeder precisa ser rodado no ambiente de destino). Body termina com `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

---

## Parte Front (agente Prisma)

### Task F1: Base — api.ts, hook e DataState

**Files:**
- Modify: `src/services/api.ts`
- Create: `src/hooks/use-async-data.ts`, `src/components/data-state.tsx`

**Interfaces:**
- Produces:
  - `export function useAsyncData<T>(load: (() => Promise<T>) | null, deps: React.DependencyList): { data: T | undefined; status: "idle" | "loading" | "error" | "ready"; retry: () => void }` — `load === null` ⇒ `status: "idle"` (sem região). Mantém `data` anterior durante novo `loading`.
  - `export type DataStatus = "loading" | "error" | "empty" | "unavailable" | "ready"` e `export function DataState(props: DataStateProps)` com `DataStateProps` da spec 1.2 **mais** `errorMessage?: string` (sobrescreve o copy padrão de `error`; usado pela Home em F7).

- [ ] **Step 1: api.ts** — remover os 3 `console.log` do topo; `getActions`, `getMatriz`, `getCustos`, `getReservoirs` sem `try/catch` (erro propaga). Tipos de retorno mantidos (sem `| null` em `getCustos`).
- [ ] **Step 2: Hook** — descarte de resposta obsoleta por contador de requisição (`useRef<number>`): a cada execução incrementa; ao resolver/rejeitar, só aplica estado se o id ainda é o atual. `retry` reexecuta o último `load`. Sem `AbortController` obrigatório.
- [ ] **Step 3: DataState** — copy exato da spec 1.2; `loading` com `Loader2` (lucide) animado + "Carregando…", altura mínima ~ `min-h-48`, nunca `h-screen`; botões com `Button` de `@/components/ui/button` (variant `outline`); `role="status"` em loading, `role="alert"` em error.
- [ ] **Step 4:** `npx tsc --noEmit && npx eslint src/services/api.ts src/hooks/use-async-data.ts src/components/data-state.tsx` → sem erros.
- [ ] **Step 5: Commit** `feat: base de estados de dados (useAsyncData e DataState) e api propagando erros`.

### Task F2: Matriz de Ação

**Files:** Modify `src/app/matriz/page.tsx`
**Interfaces:** Consumes `useAsyncData`, `DataState` (Task F1).

- [ ] **Step 1:** trocar o `useEffect`/`loading` próprios por `useAsyncData(() => getMatriz(id), [id])`; remover o retorno de spinner de página inteira (L116-127) — cabeçalho e filtros sempre renderizados quando há região.
- [ ] **Step 2:** status da área da tabela: `error` → `DataState error` com `retry`; dados `[]` sem filtros ativos → `unavailable` com `unavailableReason` "A Matriz de Ação desta região ainda está sendo incorporada ao sistema a partir do plano oficial." e `regionName`; filtrados vazios com filtro ativo → `empty` com `onClearFilters` resetando todos os filtros para "all"; senão tabela. Filtro "Tipo de Matriz" → rótulo "Eixo" (opções continuam vindo de `tipo_matriz`). Com `unavailable`, ocultar os filtros (não há o que filtrar).
- [ ] **Step 3: Verificar no portal** (requer Task B3 concluída no banco local): Coreaú (`basin_id=5`) → tabela com ação/responsáveis/prioridade, filtro "Eixo" com 4 opções; escolher filtro de Prioridade/Eixo que zere → `empty` + "Limpar filtros" restaura; Médio Jaguaribe (`9`) → `unavailable` com o nome da região.
- [ ] **Step 4:** tsc + eslint do arquivo → sem erros novos.
- [ ] **Step 5: Commit** `feat(matriz): estados honestos e matriz indisponivel por regiao`.

### Task F3: Monitoramento

**Files:** Modify `src/app/monitoramento/page.tsx`
**Interfaces:** Consumes Task F1. Produces (local ao arquivo): `function getExecutionStatus(item): { label: "Sem medição registrada" | "Não iniciada" | "Em andamento" | "Concluída"; perc: number | null }` baseado na última medição de `item.measurements`.

- [ ] **Step 1:** carregar ações com `useAsyncData` (deps: região + filtros), `loading` só na área da tabela; remover spinner de página inteira (L170-178).
- [ ] **Step 2:** coluna "Status Execução" pela tabela da spec 3.2 (barra só em "Em andamento", `style={{ width: \`${perc}%\` }}`; sem `animate-ping` em nenhum caso); "IEA Rel." → "—" sem medição. Remover o "ID: #…" visível.
- [ ] **Step 3:** aviso informativo no topo (copy exato da spec 3.2) quando nenhuma ação **da região sem filtros** tem medição: segundo `useAsyncData(() => getActions(id), [id])` (só região; independe dos filtros) e `!data.some(a => a.measurements?.length)`. Enquanto esse carregamento não termina ou falha, não mostrar o aviso. `error`/`empty` da tabela via `DataState`.
- [ ] **Step 4: Portal:** Médio Jaguaribe → aviso no topo, todas as linhas "Sem medição registrada" e "—", nenhuma barra/pulso/"ID: #"; trocar filtro → cabeçalho e aviso permanecem. Mobile 390px (recapturar; a captura anterior estava errada).
- [ ] **Step 5:** tsc + eslint. **Commit** `feat(monitoramento): status real da execucao e aviso quando nao ha medicoes`.

### Task F4: Planos de Ação e Previsão de Custos

**Files:** Modify `src/app/planos/page.tsx`, `src/app/custos/page.tsx`

- [ ] **Step 1: Planos** — `useAsyncData` (região + filtros); `loading` só na área da tabela (remover L169-180); `error` com retry; lista vazia com filtros → `empty` com "Limpar filtros" (substitui "Nenhum resultado para estes filtros" atual).
- [ ] **Step 2: Custos** — `useAsyncData`; `getCustos` agora lança: `error` com retry no lugar de "Nenhum dado financeiro disponível." quando falha; resposta sem `planoAcao` (vazia) → `unavailable` com `unavailableReason` "A previsão de custos desta região ainda não foi incorporada ao sistema."; remover spinner de página inteira (L148-160).
- [ ] **Step 3: Portal:** Planos e Custos no Médio Jaguaribe carregam como antes; trocar filtro em Planos mantém cabeçalho e rolagem.
- [ ] **Step 4:** tsc + eslint. **Commit** `feat(planos,custos): estados de carregamento e erro sem desmontar a pagina`.

### Task F5: Situação Hídrica e Identificação

**Files:** Modify `src/app/situacao-hidrica/page.tsx`, `src/app/identificacao/page.tsx`
**Interfaces:** Produces (pode ficar em `src/lib/sections.ts`): `export function isChildOf(number: string, parent: string): boolean` → `number === parent || number.startsWith(parent + ".")`.

- [ ] **Step 1:** aplicar `isChildOf` em: filtro de capítulo da aba (`situacao-hidrica` L211), filhos nível 3/4 (L352, L374), e `identificacao` L37. Para filhos estritos (níveis 3/4) usar `startsWith(parent + ".")`. Conferir manualmente: `isChildOf("3.10","3.1") === false`, `isChildOf("3.1.2","3.1") === true`, `isChildOf("10.1","1") === false`, `isChildOf("1","1") === true` (anotar no commit; sem framework de teste).
- [ ] **Step 2:** `useAsyncData` nas duas páginas; loading só na área de conteúdo (Situação Hídrica: o loader `h-screen` L215 sai); "Nenhum dado encontrado para esta bacia." → `DataState` (`error` em falha; `empty` sem seções).
- [ ] **Step 3: Portal:** Médio Jaguaribe, as 4 abas de Situação Hídrica e Identificação mostram as mesmas seções/imagens que hoje (comparar com as capturas em `.maestri/roles/0bb04772-907b-495d-a568-3a7d044aecd6/ux-review/shots/desktop-situacao-hidrica-*.png` e `desktop-identificacao-*.png`).
- [ ] **Step 4:** tsc + eslint. **Commit** `fix(situacao-hidrica,identificacao): secoes por prefixo exato e estados honestos`.

### Task F6: Metodologia

**Files:** Modify `src/app/metodologia/page.tsx`

- [ ] **Step 1:** `useAsyncData` + `DataState` (como F5).
- [ ] **Step 2:** texto nível 1 com todos os parágrafos (split por `\n`, sem vazios); > 2 parágrafos → 2 visíveis + botão "Ler texto completo" / "Mostrar menos" (`aria-expanded`).
- [ ] **Step 3:** `getSmartSummary` retorna `""` quando não há conteúdo (remover "Detalhes das atividades e processos realizados nesta etapa."); não renderizar o `<p>` vazio. Dialog da fase: renderizar `mainSection.content` completo antes das subseções.
- [ ] **Step 4:** sem imagem → não renderizar o bloco de imagem (remover "Mockup da Aplicação Geral" L169-171 e "Espaço para Foto - …" L212), texto em largura total.
- [ ] **Step 5: Portal:** Médio Jaguaribe → texto de abertura com "Ler texto completo" funcionando; dialog de uma fase mostra o texto da fase. tsc + eslint. **Commit** `fix(metodologia): texto oficial completo e sem placeholders`.

### Task F7: Home e Indicadores

**Files:** Modify `src/app/page.tsx`, `src/app/indicadores/page.tsx`

- [ ] **Step 1: Home** — busca de `getSections` para o mapa via `useAsyncData` (só com região); `error` → no lugar da imagem, `<DataState status="error" errorMessage="Não foi possível carregar o mapa desta região." onRetry={retry} />`. Sem região → capas gerais (inalterado).
- [ ] **Step 2: Indicadores** — sem região: `return <SelectRegionPrompt moduleName="Indicadores" />` (remover o `return` que deixa `loading` preso). Nada mais muda; continua fora do menu.
- [ ] **Step 3:** tsc + eslint. **Commit** `fix(home,indicadores): erro do mapa visivel e indicadores sem spinner infinito`.

### Task F8: Verificação final e PR

- [ ] **Step 1:** `npx tsc --noEmit` e `npx eslint src` → apenas os 13 erros pré-existentes (nenhum novo).
- [ ] **Step 2: API fora do ar:** `docker stop regioes_api`; em cada uma das 8 páginas (Home com região, Identificação, Metodologia, Situação Hídrica, Matriz, Planos, Monitoramento, Custos) → `error` com título visível; em Planos, também trocar um filtro com a API parada → `error` sem perder cabeçalho/filtros. `docker start regioes_api` → "Tentar novamente" carrega.
- [ ] **Step 3: Troca rápida:** em Situação Hídrica, selecionar Coreaú e imediatamente Salgado no seletor do topo → conteúdo final é do Salgado.
- [ ] **Step 4:** screenshots 1440 e 390 das 8 páginas no Médio Jaguaribe + Matriz no Coreaú; nenhum overflow horizontal (`scrollWidth === innerWidth`).
- [ ] **Step 5:** `git push -u origin feat/estados-honestos`; `gh pr create --base dev` com resumo por página, dependência opcional do PR do Back (front funciona sem ele), lista do que foi verificado. Body termina com `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## Ordem e paralelismo

Back (B1→B3) e Front (F1→F8) correm em paralelo. F2 Step 3 e F3 Step 4 precisam de B3 concluído para o resultado final (antes disso, Médio Jaguaribe ainda mostra a matriz quebrada e medições zeradas).
