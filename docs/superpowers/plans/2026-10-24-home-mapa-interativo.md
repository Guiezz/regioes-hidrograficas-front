# Home com mapa interativo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o card de capas da home por um mapa SVG interativo do Ceará (11 regiões coloridas) sincronizado com uma lista/seletor, levando a `/identificacao?basin_id=<id>`.

**Architecture:** Só front. Regiões fixas (cor, chave, forma no SVG) em `src/lib/regions.ts`, casadas com a API por nome normalizado. Um componente SVG controlado desenha o mapa; um `RegionPicker` liga mapa, lista (desktop), seletor (celular) e painel de resultado a `useReservoir()`. A `page.tsx` perde imagens, dropdown grande e CTAs.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix Select (existente), Node 24.

**Spec:** `docs/superpowers/specs/2026-10-24-home-mapa-interativo-design.md` — leia inteira antes de começar. O SVG de origem está em `docs/superpowers/assets/mapa_ceara_vetor.svg`.

## Global Constraints

- Branch `feat/home-mapa-interativo` (já criada a partir de `origin/dev`, com spec, plano e SVG commitados); PR para `dev`. Não mergear.
- Front em :3000 e API local em :8080 já rodando (dados reais, mesmos nomes da produção). Portal "SIGRH App" com `maestri portal resize` para 1280×800 e 390×844.
- Sem dependência nova. Sem mudar API, `ReservoirContext`, rotas ou outras páginas. Header já é oculto em `/`.
- Usar "região hidrográfica" (nunca "bacia") nos textos; português BR.
- **A forma cinza decorativa (`#C9D1DB`) nunca é nomeada** em código, comentários, aria ou textos; sem hover, clique ou foco. Só 11 regiões na lista.
- Cores finais: Banabuiú `#784421`, Coreaú `#672178`, Sertões de Crateús `#B26B45`, Alto Jaguaribe `#569F4A`, Baixo Jaguaribe `#D40000`, Serra da Ibiapaba `#008001`, Litoral `#FF801A`, Médio Jaguaribe `#242868`, Bacias Metropolitanas `#4D4D4D`, Salgado `#D4AA00`, Curu `#1187D0`.
- viewBox `0 0 2491 2752`; região inativa com opacidade 0,22; contorno branco ~9 unidades; alvos de toque ≥ 44px; texto ≥ 12px com contraste AA (slate ≥ 500 em fundo claro).
- Gate de código de toda task: `npx tsc --noEmit && npm run lint` sem erros. Task final: `npm run build`.
- Commits terminam com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **API devolve nomes diferentes dos esperados** (ex.: "Região Hidrográfica do Curu", maiúsculas, acentos) → ainda casa; o que não casa fica desabilitado, sem quebrar a página. *Teste: Task 1.*
2. **API devolve uma região a mais** (a que não entra no sistema) → não aparece em lugar nenhum. *Teste: Task 1.*
3. **Abrir `/?basin_id=<id>` direto** → região já destacada no mapa, lista e painel. *Teste: Task 4, Step 4.*
4. **Carregando ou API fora do ar** → mapa inerte, mensagem + "Tentar novamente", sem tela quebrada. *Teste: Task 4, Step 4.*
5. **Celular 390×844** → mapa visível sem rolar muito, nenhum scroll horizontal, seletor único. *Teste: Task 4, Step 4.*

---

### Task 1: Regiões fixas e casamento com a API

**Files:**
- Create: `src/lib/regions.ts`
- Create: `scripts/check-regions.ts` (verificação executável; remover se o repo ganhar runner de testes)

**Interfaces:**
- Produces:
  - `type RegionKey = "alto-jaguaribe" | "banabuiu" | "sertoes-de-crateus" | "bacias-metropolitanas" | "salgado" | "coreau" | "medio-jaguaribe" | "curu" | "litoral" | "baixo-jaguaribe" | "serra-da-ibiapaba"`
  - `interface RegionDef { key: RegionKey; label: string /* nome oficial, exibido na home */; color: string; shapeIndex: number /* 1-12, ordem do SVG */ ; match: string[] /* nomes normalizados aceitos: oficial + nome da API */ }`
  - Aliases obrigatórios (nomes reais da API conferidos em produção): Sertões de Crateús `["sertoes de crateus", "crateus"]`, Serra da Ibiapaba `["serra da ibiapaba", "ibiapaba"]`, Bacias Metropolitanas `["bacias metropolitanas", "metropolitana"]`; as demais só o próprio nome.
  - `const REGIONS: RegionDef[]` (11 itens, ordem alfabética por `label`, valores da tabela de mapeamento da spec)
  - `normalizeName(name: string): string` — minúsculas, sem acento, sem prefixo "região hidrográfica (do|da|de)", espaços colapsados
  - `interface MatchedRegion extends RegionDef { reservoir: ReservoirData | null }`
  - `matchRegions(api: ReservoirData[]): MatchedRegion[]` — sempre 11 itens; `reservoir` null quando não casa; itens da API sem região fixa são ignorados; em duplicidade usa o primeiro e `console.warn` fora de produção.

- [x] **Step 1: Escrever `scripts/check-regions.ts` com asserts (rodar com `npx tsx`)** cobrindo: `normalizeName("Região Hidrográfica do Médio Jaguaribe") === "medio jaguaribe"`; `normalizeName("SERTÕES DE CRATEÚS") === "sertoes de crateus"`; lista da API com as 11 regiões + 1 item extra qualquer → `matchRegions` retorna 11 e nenhum `reservoir` é o item extra; lista sem "Curu" → `curu.reservoir === null`; "Alto Jaguaribe" não casa com "Baixo Jaguaribe" nem "Médio Jaguaribe" (casamento por igualdade da chave normalizada, não por `includes`); **com a lista real da API** (`[{1,"Alto Jaguaribe"},{2,"Baixo Jaguaribe"},{3,"Banabuiú"},{4,"Crateús"},{5,"Coreaú"},{6,"Curu"},{7,"Ibiapaba"},{8,"Litoral"},{9,"Médio Jaguaribe"},{10,"Metropolitana"},{11,"Salgado"}]`) as 11 regiões casam, com `sertoes-de-crateus → id 4`, `serra-da-ibiapaba → id 7`, `bacias-metropolitanas → id 10`, e os `label` continuam os nomes oficiais.
- [x] **Step 2: Rodar e ver falhar** — `npx tsx scripts/check-regions.ts` → erro de módulo.
- [x] **Step 3: Implementar `src/lib/regions.ts`** com os valores da spec. Se `tsx` não estiver disponível, `npx --yes tsx`.
- [x] **Step 4: Rodar e ver passar** — saída `ok` sem exceção.
- [x] **Step 5: Gate e commit** — `git add src/lib/regions.ts scripts/check-regions.ts && git commit -m "feat(home): regiões fixas e casamento com a API"`

### Task 2: Paths do mapa a partir do SVG

**Files:**
- Create: `src/components/home/ceara-map-paths.ts`

**Interfaces:**
- Produces: `export const MAP_VIEWBOX = "0 0 2491 2752"`; `export const REGION_PATHS: Record<RegionKey, string>` (valor `d`); `export const DECORATIVE_PATH: string` (forma 5).

- [x] **Step 1: Gerar o arquivo com um script descartável** (fora do repo, ex.: `/tmp`): ler `docs/superpowers/assets/mapa_ceara_vetor.svg`, extrair os `d` de todos os `<path>`, descartar o índice 0 (contorno branco), usar os índices 1–12 conforme a tabela da spec (campo `shapeIndex` de `REGIONS`; forma 5 → `DECORATIVE_PATH`) e escrever o módulo TypeScript com `as const`. Não commitar o script.
- [x] **Step 2: Verificar** — `node -e` ou teste simples: 11 chaves em `REGION_PATHS`, todas as strings começam com `M`, `DECORATIVE_PATH` não vazio, tamanho do arquivo ≲ 60 KB.
- [x] **Step 3: Gate e commit** — `git add src/components/home/ceara-map-paths.ts && git commit -m "feat(home): paths do mapa do Ceará"`

### Task 3: Componente `CearaRegionsMap`

**Files:**
- Create: `src/components/home/CearaRegionsMap.tsx`

**Interfaces:**
- Consumes: `REGIONS`, `RegionKey` (Task 1); `REGION_PATHS`, `DECORATIVE_PATH`, `MAP_VIEWBOX` (Task 2).
- Produces: `CearaRegionsMap(props: { enabledKeys: RegionKey[]; activeKey: RegionKey | null; hoverKey: RegionKey | null; onHover: (k: RegionKey | null) => void; onSelect: (k: RegionKey) => void; disabled?: boolean; className?: string })`. Client component.

- [x] **Step 1: Implementar** `<svg viewBox role="img" aria-label="Mapa das regiões hidrográficas do Ceará">` com a forma decorativa primeiro (fill `#C9D1DB`, `pointer-events-none`, opacidade 0,5 quando há ativa/hover, `aria-hidden`), depois um `<path>` por região habilitada: `fill=color`, `stroke="#fff"`, `strokeWidth` 9 (maior na ativa/hover, passando a região em foco para o final da ordem de desenho para o contorno ficar por cima), opacidade 1 se não há ativa/hover ou se é a ativa/hover, senão 0,22; `transition-opacity` desligada com `motion-reduce`; `cursor-pointer`; `onMouseEnter/Leave` → `onHover`; `onClick` → `onSelect`; `aria-hidden`, `tabIndex={-1}`. Regiões não habilitadas: cinza claro, sem eventos. Com `disabled`, tudo inerte e opacidade 0,5. Legenda abaixo do SVG: "Toque em uma região" no celular, "Passe o mouse ou clique em uma região" no desktop.
- [x] **Step 2: Gate** (`tsc` + `lint`) e **commit** `feat(home): componente CearaRegionsMap`.

### Task 4: `RegionPicker` e nova home

**Files:**
- Create: `src/components/home/RegionPicker.tsx`
- Modify: `src/app/page.tsx` (remover: busca de imagens `useAsyncData`/`getSections`/`BasinMapInfo`/`getImageUrl`/`selectedMapType`, bloco de seleção com `ReservoirSelector fullWidth`, os dois CTAs, o card de capas com alternância Caracterização/Infraestrutura; manter título com gradiente, parágrafo, grade `features`/`FeatureCard`, rodapé)

**Interfaces:**
- Consumes: `matchRegions`, `MatchedRegion` (Task 1); `CearaRegionsMap` (Task 3); `useReservoir()` (`selectedReservoir`, `reservoirs`, `setSelectedReservoir`, `isLoading`, `loadError`, `retryReservoirs`).
- Produces: `RegionPicker()` sem props, client component.

- [x] **Step 1: Implementar `RegionPicker`**: `const matched = useMemo(() => matchRegions(reservoirs), [reservoirs])`; `activeKey` = chave da região cujo `reservoir.id === selectedReservoir?.id`; estado local `hoverKey`. Seleção chama `setSelectedReservoir(matched.reservoir)`. Desktop (`hidden lg:flex`): mapa + lista de botões (bolinha na cor, nome, `aria-pressed`, ativa com fundo `#E4EFFB`, desabilitada com `disabled`). Celular (`lg:hidden`): mapa → texto "ou escolha pela lista" → seletor único (reaproveitar `ReservoirSelector fullWidth`; se ele exibir regiões fora das 11, trocar por `<select>` nativo dentro do `RegionPicker` com só as regiões casadas, sem alterar o componente compartilhado). Painel de resultado: sem seleção, texto "Escolha uma região para começar"; com seleção, rótulo "Região selecionada", nome em destaque e botão `Link` "Explorar região" → `/identificacao?basin_id=${id}` (altura mínima fixa para não pular o layout). `isLoading`/`loadError` conforme a spec (mapa `disabled`; erro reaproveita a mensagem e o botão de `ReservoirSelector`).
- [x] **Step 2: Refatorar `page.tsx`**: coluna esquerda com título, parágrafo (no celular depois do resultado: usar `order-*` ou renderizar o parágrafo fora do bloco da esquerda), dica e link discreto "Conhecer a metodologia" (usar o mesmo destino que o site já tem para a metodologia; se não houver rota, deixar o link fora e avisar no PR); coluna direita com `<RegionPicker />`. Manter `animate-in fade-in slide-in-from-bottom-4` já usados.
- [x] **Step 3: Gate** — `npx tsc --noEmit && npm run lint`; confirmar com `grep -rn "capasrh\|situacao-hidrica?basin_id\|custos?basin_id" src/app/page.tsx` que não sobrou nada.
- [x] **Step 4: Verificação manual** (`npm run dev`, API local ou apontada para a de produção): (a) hover/clique em cada forma destaca a região **esperada pela tabela da spec** — se alguma forma estiver trocada, corrigir `shapeIndex` em `REGIONS` (e só isso); (b) lista, mapa e seletor sempre mostram a mesma seleção; (c) `/?basin_id=<id>` abre já selecionado; (d) derrubar a API: mapa inerte + "Tentar novamente"; (e) 1280×800 e 390×844: sem scroll horizontal, mapa na primeira dobra do celular; (f) Tab/Enter/Space na lista e no seletor.
- [x] **Step 5: Commit** — `git add -A src && git commit -m "feat(home): mapa interativo no lugar das capas"`

### Task 5: Build e PR

- [x] **Step 1:** `npx tsc --noEmit && npm run lint && npm run build` → sem erros; anotar o tamanho da rota `/` no output do build.
- [x] **Step 2:** `git push -u origin feat/home-mapa-interativo` e abrir PR para `dev` com capturas desktop e celular; mencionar o que saiu da home (imagens, dropdown, CTAs) e que `scripts/check-regions.ts` existe.

## Desvios

- **Task 4 — contorno do foco (pedido do Guilherme):** a ordem dos `<path>` do mapa é fixa; a região em foco ganha um `<path>` extra no fim do SVG (`fill="none"`, `stroke="#fff"`, `strokeWidth` 16, `pointer-events-none`, `aria-hidden`). Antes (Task 3) a região em foco era movida para o fim do array, o que fazia o React mover o nó no DOM sob o cursor. Verificado passando o mouse pela divisa Médio/Baixo Jaguaribe: o destaque troca uma vez por região, sem piscar.
- **Task 4 — seletor do celular:** `<select>` nativo dentro do `RegionPicker`, só com as 11 regiões casadas e o nome oficial (o `ReservoirSelector` lista os nomes da API, inclusive itens fora das 11). `ReservoirSelector` é reaproveitado só nos estados de carregamento e erro, dentro de um wrapper que deixa a mensagem quebrar linha (o componente usa `whitespace-nowrap`).
- **Task 4 — layout:** grade 4fr/8fr no hero (título, parágrafo e link à esquerda; mapa + lista à direita); no desktop o painel de resultado fica acima da lista para o botão "Explorar região" aparecer na primeira dobra em 1280×800. No erro de carregamento o painel de resultado é ocultado. Link "Conhecer a metodologia" aponta para `/metodologia` (rota existente).
- **Task 4 — estado de erro da API:** simulado abrindo `http://127.0.0.1:3000/` (a API só aceita a origem `localhost:3000`, então a chamada falha por CORS); a API local não foi derrubada.

