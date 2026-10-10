# Imagens Ampliáveis e Alinhamento (Identificação + Situação Hídrica) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir o tamanho das imagens nas páginas Identificação e Situação Hídrica (layout texto + miniatura lado a lado no desktop), permitir ampliar a imagem com um clique, e alinhar a borda direita dos textos com a das imagens.

**Architecture:** Um componente cliente novo, `ZoomableImage`, renderiza uma miniatura (moldura 4:3, `object-contain`) que abre o `Dialog` Radix já existente (`src/components/ui/dialog.tsx`) com a imagem grande. As duas páginas passam a usar uma grade `lg:grid-cols-5` por seção (texto 3 colunas à esquerda, figura 2 colunas à direita); abaixo de `lg`, tudo empilha em uma coluna (título → imagem → texto). Os `max-w-*` que estreitavam os textos são removidos.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Radix Dialog (via `@/components/ui/dialog`), lucide-react, `next/image` com `unoptimized`.

**Spec:** design curto aprovado no chat em 2026-10-09 (caminho *bounded*, sem arquivo de spec). Resumo:
1. Componente `src/components/zoomable-image.tsx`: miniatura clicável (moldura 4:3, figura inteira, ícone de lupa no hover) → Dialog com a imagem até ~90vw / ~85vh, título como legenda, fecha com X / Esc / clique fora. Remove os efeitos de hover atuais (scale/grayscale).
2. Identificação: título largura total; abaixo, texto 3/5 à esquerda + figura e legenda "Figura - … Fonte …" 2/5 à direita (≥ `lg`); empilhado abaixo de `lg`. Remover `max-w-4xl` do texto das seções e `max-w-2xl` da introdução.
3. Situação Hídrica: mesmo layout nas seções nível 2 com imagem; seções sem imagem continuam com texto em largura total; introdução perde `max-w-4xl`; cards de subseções (grid 2 colunas) inalterados.
4. Fora de escopo: página Metodologia.

## Global Constraints

- Repositório: `/Users/guilhermebessa/Projetos/sadgrh/regioes-hidrograficas-web`. Branch `feat/imagens-ampliaveis` criada a partir de `dev` atualizada; PR para `dev`.
- Sem novas dependências. O projeto não tem framework de testes; **não** adicionar um. O gate de cada tarefa é `npx tsc --noEmit` + `npx eslint <arquivos>` sem erros, e a verificação visual no portal Maestri "SIGRH App" (http://localhost:3000; API em http://localhost:8080 já rodando).
- Linha de base (`dev` @ 32301d7): `tsc` e `eslint` nos arquivos-alvo passam sem erros. Nenhuma tarefa pode introduzir erro ou warning novo.
- Breakpoint do lado a lado: `lg` (≥ 1024px). Proporção: texto `lg:col-span-3`, figura `lg:col-span-2`.
- Textos de UI em português. `aria-label` da miniatura: `` `Ampliar imagem: ${alt}` ``.
- Manter `unoptimized` em todo `next/image` (as imagens vêm da API em `localhost:8080/assets/**`).
- Todo commit termina com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (via `-m` extra).
- Não alterar Metodologia, `ui/dialog.tsx`, nem o backend.

## Review Focus

1. **Imagem muito larga** (ex.: `balanco/cenario_futuro.png`, 2410×865) → aparece inteira, sem corte, na miniatura e no Dialog. *Teste: Task 3, Step 4.*
2. **Teclado** → Tab foca a miniatura, Enter abre o Dialog, Esc fecha e o foco volta para a miniatura. *Teste: Task 2, Step 5.*
3. **Mobile 390px** → sem scroll horizontal; ordem título → imagem → texto; a imagem ampliada cabe na tela. *Teste: Task 4, Step 3.*
4. **Seção sem imagem** (ex.: Identificação 1.1) → texto ocupa a largura total, sem coluna vazia à direita. *Teste: Task 2, Step 4.*
5. **Imagem que falha ao carregar** → a moldura 4:3 mantém o layout (sem colapso da grade). *Garantido pela moldura de proporção fixa com `fill`; conferido na revisão de código da Task 1, Step 3.*

---

### Task 1: Branch + componente `ZoomableImage`

**Files:**
- Create: `src/components/zoomable-image.tsx`
- Add: `docs/superpowers/plans/2026-10-09-imagens-ampliaveis.md` (este plano)

**Interfaces:**
- Consumes: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle` de `@/components/ui/dialog` (o `DialogContent` aceita `className` e `showCloseButton?: boolean`, padrão `true`; por padrão tem `sm:max-w-lg`, que **precisa** ser sobrescrito).
- Produces:
  ```ts
  export interface ZoomableImageProps { src: string; alt: string; className?: string }
  export function ZoomableImage(props: ZoomableImageProps): JSX.Element
  ```
  `src` já é a URL absoluta (as páginas continuam usando o próprio `getImageUrl`). `className` é aplicado ao botão/miniatura externo.

- [ ] **Step 1: Criar a branch**

  ```bash
  cd /Users/guilhermebessa/Projetos/sadgrh/regioes-hidrograficas-web
  git checkout dev && git pull --ff-only && git checkout -b feat/imagens-ampliaveis
  ```
  Esperado: `Switched to a new branch 'feat/imagens-ampliaveis'`.

- [ ] **Step 2: Implementar `ZoomableImage` em `src/components/zoomable-image.tsx`** (`"use client"`)
  - Miniatura = `DialogTrigger asChild` envolvendo `<button type="button" aria-label={`Ampliar imagem: ${alt}`}>` com `relative block w-full aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm cursor-zoom-in` + anel de foco visível (`focus-visible:ring-2 focus-visible:ring-sky-500`).
  - Dentro: `next/image` com `fill`, `sizes="(min-width: 1024px) 40vw, 100vw"`, `className="object-contain p-2"`, `unoptimized`; e um selo com o ícone `ZoomIn` (lucide) no canto inferior direito, `opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100` (sempre visível abaixo de `lg`: `max-lg:opacity-100`).
  - `DialogContent` com `className="w-auto max-w-[95vw] sm:max-w-[95vw] p-3 sm:p-4"`; dentro, `next/image` com `width={1600} height={1200}`, `className="h-auto w-auto max-h-[85vh] max-w-full object-contain"`, `unoptimized`; abaixo, `DialogTitle` com `alt` em `text-sm font-medium text-slate-600` (o Radix exige um título por acessibilidade).
  - Sem efeitos de scale/grayscale.

- [ ] **Step 3: Verificar tipos/lint e revisar a moldura**

  Run: `npx tsc --noEmit && npx eslint src/components/zoomable-image.tsx`
  Esperado: nenhuma saída, exit 0. Conferir no código que a miniatura tem `aspect-[4/3]` + `fill` (Review Focus 5).

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/zoomable-image.tsx docs/superpowers/plans/2026-10-09-imagens-ampliaveis.md
  git commit -m "feat(ui): adiciona componente ZoomableImage com ampliacao em dialog" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 2: Identificação — layout lado a lado + alinhamento

**Files:**
- Modify: `src/app/identificacao/page.tsx` (introdução ~L124-130; loop de seções ~L133-167)

**Interfaces:**
- Consumes: `ZoomableImage({ src, alt })` da Task 1.
- Produces: nada consumido por outras tarefas.

- [ ] **Step 1: Alinhar a introdução**
  Remover `max-w-2xl` do `div` do `mainTitle.content` (manter tamanho de fonte/justificação).

- [ ] **Step 2: Reestruturar cada `<article>`**
  - `h2` continua em largura total.
  - Abaixo: se `section.image`, `div` com `grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12 items-start`; senão, um `div` simples.
  - Figura (primeiro no DOM, para empilhar antes do texto no mobile): `<figure className="lg:col-span-2 lg:order-2">` com `<ZoomableImage src={getImageUrl(section.image)} alt={section.title} />` e um `<figcaption>` com o mesmo conteúdo da legenda atual (ícone `Anchor` + "Figura - {title}. Fonte: Acervo Técnico da Unidade de Gestão Hidrográfica.").
  - Texto: `<div className="lg:col-span-3 lg:order-1">{renderContent(section.content)}</div>` — sem `max-w-4xl`.
  - Remover o `import Image from "next/image"` se ficar sem uso.

- [ ] **Step 3: Tipos/lint**

  Run: `npx tsc --noEmit && npx eslint src/app/identificacao/page.tsx`
  Esperado: exit 0, sem saída.

- [ ] **Step 4: Verificar no portal (desktop)**
  `maestri portal navigate "SIGRH App" "http://localhost:3000/identificacao"` → selecionar "Alto Jaguaribe" no combobox do topo (a seleção se perde em reload completo) → `maestri portal screenshot "SIGRH App"` em 2-3 posições de scroll.
  Esperado: (a) seções com imagem mostram texto à esquerda e miniatura ~40% à direita; (b) a borda direita dos parágrafos justificados coincide com a borda direita da miniatura e com a introdução; (c) a seção 1.1 (sem imagem) tem texto em largura total, sem coluna vazia (Review Focus 4).

- [ ] **Step 5: Verificar ampliação e teclado**
  Clicar em uma miniatura → screenshot: Dialog aberto com a imagem grande e o título. `maestri portal key "SIGRH App" "Escape"` → Dialog fecha. Depois, focar a miniatura via `Tab` até ela e `maestri portal key "SIGRH App" "Enter"` → abre; `Escape` → fecha (Review Focus 2).

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/identificacao/page.tsx
  git commit -m "feat(identificacao): imagens em miniatura ampliavel ao lado do texto e alinhamento"
  ```

---

### Task 3: Situação Hídrica — layout lado a lado + alinhamento

**Files:**
- Modify: `src/app/situacao-hidrica/page.tsx` (introdução ~L341; bloco de imagem/texto das `topLevelSections` ~L355-375)

**Interfaces:**
- Consumes: `ZoomableImage({ src, alt })` da Task 1.

- [ ] **Step 1: Alinhar a introdução**
  No `div` do `mainTitle?.content` (~L341), trocar `max-w-4xl pt-8 border-t border-slate-100` por `pt-8 border-t border-slate-100`.

- [ ] **Step 2: Reestruturar o corpo de cada `topLevelSection`**
  Mesmo padrão da Task 2, Step 2: `h2` em largura total; se houver `section.image`, grade `grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12 items-start` com `<div className="lg:col-span-2 lg:order-2"><ZoomableImage src={getImageUrl(section.image)} alt={section.title} /></div>` e texto em `lg:col-span-3 lg:order-1`; sem imagem, texto em largura total. **Sem** legenda "Figura - …" aqui (a página atual não tem). O bloco `children` (cards em `md:grid-cols-2`) fica fora da grade, inalterado, logo abaixo. Remover o import de `Image` se ficar sem uso.

- [ ] **Step 3: Tipos/lint**

  Run: `npx tsc --noEmit && npx eslint src/app/situacao-hidrica/page.tsx`
  Esperado: exit 0, sem saída.

- [ ] **Step 4: Verificar no portal (desktop), todas as abas**
  Navegar para `/situacao-hidrica`, selecionar "Alto Jaguaribe", percorrer as abas (Infraestrutura Hídrica, Demanda Hídrica, Oferta Hídrica, Balanço Hídrico) com screenshots.
  Esperado: layout lado a lado nas seções com imagem; introdução alinhada com as figuras; cards de subseção inalterados; na aba **Balanço Hídrico**, a seção "Futura" (`cenario_futuro.png`, 2410×865) aparece inteira na miniatura e, ao clicar, inteira no Dialog (Review Focus 1).

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/situacao-hidrica/page.tsx
  git commit -m "feat(situacao-hidrica): imagens em miniatura ampliavel ao lado do texto e alinhamento"
  ```

---

### Task 4: Verificação final (build + mobile) e PR

**Files:** nenhum novo.

- [ ] **Step 1: Lint completo**

  Run: `npm run lint`
  Esperado: sem erros novos em relação à `dev`.

- [ ] **Step 2: Build de produção**

  Run: `npm run build`
  Esperado: `✓ Compiled successfully` e as rotas `/identificacao` e `/situacao-hidrica` listadas, exit 0. (O `next dev` em :3000 pode continuar rodando.)

- [ ] **Step 3: Verificar mobile (390×844)**
  `maestri portal create "http://localhost:3000/identificacao" "SIGRH Mobile" --size 390x844` → selecionar a região → screenshots de Identificação e Situação Hídrica; abrir uma imagem ampliada.
  Esperado: sem scroll horizontal; ordem título → imagem → texto; ícone de lupa visível; imagem ampliada cabe na tela e fecha com o X (Review Focus 3). Ao final, pedir ao Guilherme para fechar o portal "SIGRH Mobile" (não fechar por conta própria).

- [ ] **Step 4: Push e PR**

  ```bash
  git push -u origin feat/imagens-ampliaveis
  gh pr create --base dev --title "feat: imagens ampliaveis e alinhamento em Identificacao e Situacao Hidrica" --body "<resumo + checklist de verificação; terminar com a linha: 🤖 Generated with [Claude Code](https://claude.com/claude-code)>"
  ```
  Esperado: URL do PR. Registrar o link em "Tasks for Guilherme" para revisão.
