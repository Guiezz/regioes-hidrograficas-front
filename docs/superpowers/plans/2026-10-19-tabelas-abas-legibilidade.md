# Tabelas no celular, abas fixas e legibilidade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Planos, Matriz e Custos sem nada cortado em qualquer largura (cards em áreas estreitas), valores grandes de Custos legíveis, prioridade vazia honesta, abas da Situação Hídrica fixas ao rolar e todo texto com ≥ 12px e contraste AA.

**Architecture:** Só front. Cada página com tabela renderiza duas visões dos mesmos dados paginados (cards e tabela), alternadas por container query do Tailwind v4 no envoltório. Um formatador puro novo em `src/lib/format.ts`. A legibilidade é uma passada mecânica de classes no `src/`, regida pela regra de fundo claro/escuro da spec.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4 (container queries nativas: `@container`, `@md:`, `@2xl:`, `@5xl:`), Node 24.

**Spec:** `docs/superpowers/specs/2026-10-19-tabelas-abas-legibilidade-design.md` — leia inteira antes de começar; as tabelas de estilos e as regras de contraste estão lá.

## Global Constraints

- Repo `/Users/guilhermebessa/Projetos/sadgrh/regioes-hidrograficas-web`, branch `feat/tabelas-abas-legibilidade` (já existe a partir de `origin/dev`, com a spec commitada). PR para `dev`. Não mergear.
- Sem dependência nova. Sem mudar API, dados, textos (copy) ou rotas. O texto "Não informada" é o único texto novo.
- Breakpoints por **container** (não viewport): Planos tabela em `@5xl` (1024px), Matriz em `@2xl` (672px), Custos variáveis em `@md` (448px).
- Mínimo 12px (`text-xs`) para todo texto; contraste conforme a spec (fundo claro: slate ≥ 500, cores ≥ 600, amber ≥ 700; fundo escuro: slate ≤ 400).
- Gate de código de toda task: `npx tsc --noEmit && npm run lint` sem erros.
- Portais: "SIGRH App" (desktop; usar `maestri portal resize "SIGRH App" W H`) e "SIGRH Mobile" (390×844). Front em :3000, API em :8080 já rodando. Região de teste: `?basin_id=3` (Banabuiú) e `?basin_id=9` (Médio Jaguaribe). A barra lateral recolhe pelo botão `‹` do cabeçalho.
- Ao clicar em opções do Radix Select pelo portal, se o ref falhar, use coordenadas `x,y`; nunca `click` com ref vazio.
- Commits terminam com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Barra lateral recolhida em 1280px** → Planos mostra tabela (área ≥ 1024) e, aberta, mostra cards; nunca uma tabela cortada. *Teste: Task 2, Step 4.*
2. **Filtro que zera resultados e troca de página** → cards e tabela mostram o mesmo estado vazio ("Nenhuma ação encontrada.") e a mesma página. *Teste: Task 2, Step 4 e Task 3, Step 4.*
3. **Investimento com unidade longa** (`/ ano`, `/ município`) → valor numa linha, unidade embaixo, nada sobreposto na coluna de 16%. *Teste: Task 2, Step 4.*
4. **Aba trocada com a página rolada no celular** → conteúdo começa visível abaixo das abas fixas. *Teste: Task 4, Step 3.*
5. **Texto claro sobre fundo escuro** (banner de Custos, barra lateral) → continua legível depois da passada de contraste. *Teste: Task 5, Step 4.*

---

### Task 1: Formatador `formatBRLResumido` + Custos (KPIs, banner, custo fixo, lista)

**Files:**
- Create: `src/lib/format.ts`
- Modify: `src/app/custos/page.tsx` (KpiCard `:72-110`, KPIs `:199-240`, banner `:340-355`, custo fixo `:390-410`, tabela de variáveis `:415-470`)

**Interfaces:**
- Produces: `export function formatBRL(valor: number): string` (mesmo comportamento do `fmtBRL` atual, que passa a importar daqui) e `export function formatBRLResumido(valor: number): string`.
- `KpiCard` ganha prop opcional `exact?: string` (valor exato exibido pequeno abaixo do valor).

- [x] **Step 1: Escrever `src/lib/format.ts`** com as duas funções. Regras de `formatBRLResumido` (spec): ≥ 1e9 bilhão/bilhões, ≥ 1e6 milhão/milhões, ≥ 1e3 mil, abaixo disso `formatBRL`; número com `Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 })`; singular quando a parte numérica < 2; valores negativos não ocorrem (não tratar).

- [x] **Step 2: Verificar a função**
  Run: `node -e 'import("./src/lib/format.ts").then(m=>console.log([1306424435.38,2500000000,245000000,1500000,85000,950].map(m.formatBRLResumido).join(" | ")))'`
  Expected (exato): `R$ 1,31 bilhão | R$ 2,5 bilhões | R$ 245 milhões | R$ 1,5 milhão | R$ 85 mil | R$ 950,00`
  (Node 24 remove tipos sozinho; se reclamar de sintaxe, a função usou algo não apagável — simplifique.) O `Intl` põe espaço não separável (U+00A0) depois de `R$`; use o mesmo espaço não separável entre `R$`, número e unidade no resumido, para o valor nunca quebrar no meio.

- [x] **Step 3: Aplicar em Custos**
  - Substituir o `fmtBRL` local por `formatBRL` importado de `@/lib/format`.
  - KPIs "Investimento Total" e "Maior Aporte": `value={formatBRLResumido(x)}` e `exact={formatBRL(x)}`; `KpiCard` mostra `exact` em `text-xs text-slate-500 tabular-nums` abaixo do valor; os três KPIs com `h-full` e o mesmo alinhamento interno.
  - Banner "Aporte Total" (fundo escuro) e card "Custo Fixo": resumido grande + exato pequeno (no banner, exato em `text-slate-300`).
  - Tabela de custos variáveis: envoltório com `@container`; tabela atual só em `@md:` (`hidden @md:block`); abaixo disso, lista (`@md:hidden`) com um bloco por item: descrição (`text-sm text-slate-700`) em cima, valor exato (`font-mono text-sm font-bold`) embaixo; "—" quando `valorUnitario <= 0`, igual à tabela.

- [x] **Step 4: Gate + portal**
  `npx tsc --noEmit && npm run lint` limpo. Portal `/custos?basin_id=9` em 1440 e 390: KPIs mostram "R$ x,xx bilhão/milhões" com o exato embaixo, mesma altura; nenhum valor quebrado no meio; lista de variáveis em 390, tabela em 1440. Screenshots.

- [x] **Step 5: Commit**
  `git commit -m "feat(custos): valores resumidos com exato, KPIs alinhados e custos variaveis em lista no celular"` (+ trailer). Incluir o plano no commit.

---

### Task 2: Planos — tabela sem corte e cards em área estreita

**Files:**
- Modify: `src/app/planos/page.tsx` (`formatBudgetWithUnit` `:178-188`, bloco da tabela `:328-420`)

**Interfaces:**
- Consumes: `formatBRL` de `@/lib/format` (Task 1) no lugar do `Intl.NumberFormat` local.
- Produces: `formatBudgetParts(item): { valor: string; unidade: string | null }` (local à página; `unidade` null quando "Global").

- [x] **Step 1: Tabela larga** — remover `min-w-321.5`, o `max-w-[calc(100vw-3rem)]` e o `overflow-hidden` do envoltório que cortam conteúdo; larguras 20/32/18/16/14%; célula Investimento: valor `whitespace-nowrap`, unidade (`/ ano`) em linha própria `text-xs text-slate-500`.

- [x] **Step 2: Cards** — envoltório `@container`; tabela em `hidden @5xl:block`; lista de cards `@5xl:hidden` sobre o mesmo `currentItems` (mesma paginação). Conteúdo do card na ordem da spec (eixo → programa → ação → responsável + tipologia → rodapé com investimento à esquerda e prazo à direita). Estado vazio idêntico ao da tabela.

- [x] **Step 3: Gate** — `npx tsc --noEmit && npm run lint` limpo.

- [x] **Step 4: Portal** — `/planos?basin_id=3`:
  - 1440 com barra aberta: tabela com as 5 colunas inteiras, Prazo visível, sem rolagem horizontal.
  - 1280 com barra aberta → cards; recolhida → tabela (Review Focus 1).
  - 768 e 390 → cards, nada cortado, `document.documentElement.scrollWidth` = largura da janela.
  - Um filtro que zere a lista → mesmo vazio nos dois modos; página 2 → mesmos itens nos dois modos.
  - Procurar um item com unidade (não "Global") e conferir a célula (Review Focus 3); se não houver nenhum na região, dizer isso no relatório.
  Screenshots.

- [x] **Step 5: Commit** — `git commit -m "fix(planos): tabela sem colunas cortadas e cards quando a area e estreita"` (+ trailer).

---

### Task 3: Matriz — cards em área estreita e selo de prioridade honesto

**Files:**
- Modify: `src/app/matriz/page.tsx` (`getPriorityBadge` `:111-118`, tabela `:237-295`)

**Interfaces:**
- Produces: `getPriorityBadge(priority?: string)` com 4 saídas (Alta, Média, Baixa, Não informada) nos estilos da tabela da spec; "Baixa" só quando o texto normalizado contém `baix`.

- [x] **Step 1: Selo** — reescrever `getPriorityBadge` (estilos suaves da spec, `variant="outline"` ou classes equivalentes).
- [x] **Step 2: Cards** — `@container`; tabela em `hidden @2xl:block`; cards `@2xl:hidden` sobre `paginatedData`, layout da spec (ação em destaque + selo no canto; programa; responsáveis). Vazio idêntico.
- [x] **Step 3: Gate** — `npx tsc --noEmit && npm run lint` limpo. Conferir "Não informada" trocando temporariamente, no DevTools/`portal evaluate`, ou num teste manual do switch com `getPriorityBadge("")` (sem commitar código de teste); descrever como conferiu.
- [x] **Step 4: Portal** — `/matriz?basin_id=3` e `?basin_id=9` em 1440 (tabela; barra aberta e recolhida), 768 e 390 (cards). Prioridades Alta/Média/Baixa visíveis com contraste; filtro por eixo + paginação iguais nos dois modos. Screenshots.
- [x] **Step 5: Commit** — `git commit -m "fix(matriz): cards em area estreita e prioridade vazia como Nao informada"` (+ trailer).

---

### Task 4: Situação Hídrica — abas fixas

**Files:**
- Modify: `src/app/situacao-hidrica/page.tsx` (`:217` envoltório, `:241-265` bloco das abas e `TabsList`, troca de aba)

- [x] **Step 1: Sticky** — envoltório `overflow-x-hidden` → `overflow-x-clip`; bloco das abas sem `overflow-hidden`, `sticky top-0 z-20`, fundo `bg-white/95 backdrop-blur` e sombra leve só quando faz sentido (pode ser sempre). `TabsList` no celular: uma linha com `overflow-x-auto`, gatilhos `whitespace-nowrap shrink-0`; em `md:` volta ao `inline-flex` atual.
- [x] **Step 2: Troca de aba** — ao mudar de aba, se o topo do conteúdo estiver acima das abas fixas, rolar o container de rolagem principal até o início do conteúdo descontando a altura das abas (`scrollIntoView` com `scroll-margin-top` no painel é suficiente); a aba ativa usa `scrollIntoView({ inline: "nearest", block: "nearest" })` dentro da lista.
- [x] **Step 3: Portal** — `/situacao-hidrica?basin_id=9` em 1440, 768 e 390: rolar até o meio → abas visíveis no topo; trocar de aba lá embaixo → conteúdo novo começa visível logo abaixo das abas (Review Focus 4); no celular, as 4 abas numa linha com rolagem lateral. Screenshots rolados.
- [x] **Step 4: Gate + commit** — `npx tsc --noEmit && npm run lint`; `git commit -m "fix(situacao-hidrica): abas fixas ao rolar e em linha unica no celular"` (+ trailer).

---

### Task 5: Legibilidade — tamanho mínimo e contraste em todo o `src/`

**Files:**
- Modify: todos os `.tsx` em `src/` com `text-[8|9|10|11px]`, `text-slate-300/400`, `text-gray-300/400`, `placeholder:text-*-400`, textos coloridos claros (`text-blue-400/500`, `text-sky-400/500`, `text-emerald-400/500`, `text-amber-400/500/600`, `text-red-400/500`) e `tracking-[0.2em+]`.

- [x] **Step 1: Inventário** — `grep -rnE "text-\[(8|9|10|11)px\]|text-(slate|gray)-(300|400)|text-(blue|sky|emerald|red)-(400|500)|text-amber-(400|500|600)|tracking-\[0\.(1[5-9]|[2-9])" src > /tmp/legibilidade-antes.txt; wc -l /tmp/legibilidade-antes.txt`. Guardar a contagem para o relatório.
- [x] **Step 2: Aplicar as regras da spec**, arquivo por arquivo, decidindo pelo fundo de cada elemento (claro vs. escuro). Ícones (`<Svg className=…>` / componentes lucide) e traços decorativos `aria-hidden` podem ficar.
- [x] **Step 3: Gates**
  Run: `grep -rnE "text-\[(8|9|10|11)px\]" src | wc -l` → `0`.
  Run: `grep -rnE "text-(slate|gray)-(300|400)" src` → cada linha restante listada no relatório com o motivo (fundo escuro / ícone).
  Run: `npx tsc --noEmit && npm run lint && npm run build` → limpo.
- [x] **Step 4: Portal** — percorrer Início, Identificação, Metodologia, Situação Hídrica, Matriz, Planos, Monitoramento e Custos em 1440 e 390 (`basin_id=9`): nenhum texto que antes era legível ficou ilegível; banner escuro de Custos e barra lateral legíveis (Review Focus 5); rótulos em caixa alta não estouraram cards. Screenshots das 8 páginas em 1440 e de 4 em 390.
- [x] **Step 5: Commit** — `git commit -m "style: textos com no minimo 12px e contraste AA em todo o sistema"` (+ trailer).

---

### Task 6: PR

- [ ] **Step 1:** `git push -u origin feat/tabelas-abas-legibilidade`; `gh pr create --base dev --title "UX: tabelas no celular, abas fixas e legibilidade"` com body: resumo por frente (A/B/C), ids do ClickUp cobertos, decisão de container query, contagens antes/depois da Task 5, o que ficou de fora; última linha `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- [ ] **Step 2:** `gh pr checks --watch` → `Typecheck, lint e build` = pass.
- [ ] **Step 3:** Não mergear. Reportar ao orquestrador com links, commits, contagens e os caminhos dos screenshots.

## Desvios

- **Task 2 — limiar da tabela de Planos: `@5xl` (1024px) → `@[60rem]` (960px).** A página tem `max-w-5xl mx-auto px-6`, então a área útil da tabela nunca passa de 976px (1440 com barra aberta = 976px; 1280 aberta = 896px); com `@5xl` a tabela nunca apareceria. Larguras das colunas ajustadas (decisão do Guilherme): Eixo 20%, Ação 30%, Responsável 18%, Investimento 18%, Prazo 14%; Investimento com `px-3`, `text-sm tabular-nums` (sem `font-mono`), valor `whitespace-nowrap` e unidade em linha própria.
- **Task 2 — correções achadas na verificação:** a célula Eixo/Programa herdava `whitespace-nowrap` do `TableCell` (rótulos longos como "ASPECTOS POLÍTICOS-INSTITUCIONAIS" estouravam a coluna) → `whitespace-normal` na célula; o selo de Prazo ("Curto / Médio Prazo") passava da coluna de 14% → selo com `whitespace-normal text-center leading-tight` e célula com `px-3`.
- **Task 4 — offset do sticky:** o contêiner de rolagem (`main > div.overflow-y-auto`) tem `p-4 md:p-6` e o `sticky` respeita esse padding (as abas paravam 16–24px abaixo do topo, com o conteúdo aparecendo por cima); por isso o bloco usa `-top-4 md:-top-6` em vez de `top-0`.
- **Task 4 — fundo da barra fixa:** primeira versão usava `bg-white/95 backdrop-blur` (translúcido; conteúdo aparecia por baixo). Corrigido em commit próprio para `bg-white` opaco em toda a área sticky, conforme a spec ("fundo sólido").
- **Task 5 — estouros achados na verificação (causados pelo texto maior):** células do Monitoramento (Prazo e Status Execução) herdavam `whitespace-nowrap` do `TableCell` e cortavam "CURTO / MÉDIO PRAZO" e "SEM MEDIÇÃO REGISTRADA" → `whitespace-normal`; `min-w-212.5` → `min-w-270` na tabela do Monitoramento (cabeçalho "CLASSIFICAÇÃO" estourava a coluna na rolagem lateral); abas de eixo de Custos `px-6` → `px-4` (passavam 62px da área em 1440); rodapé do card de Planos ganhou `flex-wrap` (valor com unidade + selo estouravam 7px em 390).

