# Home: Card da Região sem Quebra + Texto Justificado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o card com a imagem de Caracterização da home ficar alinhado em qualquer largura (selo da região em uma linha, seletor Caracterização/Infraestrutura nunca cortado, rodapé sem aperto) e justificar os parágrafos de texto corrido da home.

**Architecture:** Mudanças só de classes Tailwind em `src/app/page.tsx`. A barra superior do card passa a `flex-wrap`; no mobile (< `sm`) o seletor ocupa uma linha própria em largura total e o rodapé empilha texto e link. Os parágrafos corridos recebem o mesmo padrão de justificação já usado em Identificação/Situação Hídrica.

**Tech Stack:** Next.js 16, React 19, Tailwind v4.

**Spec:** design curto aprovado no chat em 2026-10-10 (caminho *bounded*, sem arquivo de spec). Resumo:
1. Selo da região sempre em uma linha (`whitespace-nowrap`; se não couber, trunca com "…").
2. Barra superior com `flex-wrap`: no desktop, selo à esquerda e seletor à direita (sem mudança); no mobile, seletor desce para a linha de baixo em largura total, com os dois botões de mesma largura.
3. Rodapé: no mobile, o link "Identificação →" vai para baixo do texto, alinhado à esquerda; no desktop, igual a hoje.
4. `text-justify [hyphens:auto]` na descrição institucional, no subtítulo de "Funcionalidades do Sistema" e nas descrições dos 7 cards de funcionalidades. Não justificar títulos, rótulos, avisos na caixa azul, legendas do card e frases curtas.
5. Entra no PR #12 (branch `feat/header-sem-seletor-home`), em commits separados.

## Global Constraints

- Repositório: `/Users/guilhermebessa/Projetos/sadgrh/regioes-hidrograficas-web`, branch `feat/header-sem-seletor-home` (já existe, já tem PR #12 aberto para `dev`). Não criar branch nova.
- Apenas `src/app/page.tsx` muda. Sem dependências novas. O projeto não tem framework de testes: o gate é `npx tsc --noEmit` + `npx eslint src/app/page.tsx` sem saída, e verificação visual no portal.
- Portais: "SIGRH App" (desktop, ~1640px) e "SIGRH Mobile" (390px). Front em :3000 e API em :8080 já rodando; não reiniciar.
- Breakpoint do comportamento mobile: abaixo de `sm` (640px).
- Padrão de justificação: exatamente `text-justify [hyphens:auto]` (o `<html lang="pt-BR">` já existe).
- Commits com trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Ao selecionar opções no Radix Select pelo portal, se o clique por ref não funcionar, clicar por coordenadas `x,y` do option; nunca chamar `click` com ref vazio (gera "'' is not a valid selector" no overlay do Next).

## Review Focus

1. **Nomes mais longos em 390px** ("Baixo Jaguaribe", "Médio Jaguaribe") → selo em uma linha, os dois botões do seletor inteiros e visíveis, nada cortado pela borda do card. *Teste: Task 1, Step 4.*
2. **Largura `lg` (~1024–1279px)**, onde o card é mais estreito (`lg:max-w-md`) → se selo + seletor não couberem lado a lado, o seletor desce para a linha de baixo alinhado à direita, sem corte. *Teste: Task 1, Step 5.*
3. **Sem região selecionada** → "Regiões Hidrográficas do Ceará" e "11 Regiões" em uma linha cada, em 390px. *Teste: Task 1, Step 4.*
4. **Sem scroll horizontal** em 390px depois das mudanças (o fix de `min-w-0` deste PR não pode regredir). *Teste: Task 1, Step 4.*
5. **Justificação em colunas estreitas** (cards de funcionalidades em 390px) → sem "rios" grandes entre palavras; hifenização em português ativa. *Teste: Task 2, Step 3.*

---

### Task 1: Card da região — barra superior e rodapé

**Files:**
- Modify: `src/app/page.tsx:204-243` (barra superior), `src/app/page.tsx:279-308` (rodapé)

**Interfaces:** nenhuma (só classes).

- [ ] **Step 1: Barra superior**
  - Container (L205): acrescentar `flex-wrap` às classes atuais.
  - Selo (L206): acrescentar `whitespace-nowrap min-w-0 max-w-full`; envolver o texto (`Região {nome}` / `Regiões Hidrográficas do Ceará`) em `<span className="truncate">`; acrescentar `shrink-0` ao ícone `MapPin`.
  - Seletor (L215): acrescentar `w-full sm:w-auto sm:ml-auto`; em cada um dos dois `<button>`, acrescentar `flex-1 sm:flex-none whitespace-nowrap text-center`.
  - Chip "11 Regiões" (L242): acrescentar `whitespace-nowrap`.

- [ ] **Step 2: Rodapé**
  - Container (L280): trocar `flex items-center justify-between gap-3` por `flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3`.
  - Bloco de texto (L281, `space-y-0.5`): acrescentar `min-w-0`.
  - Link "Identificação" (L296) e o span "Aguardando seleção": acrescentar `-ml-2.5 sm:ml-0` ao link (para o texto alinhar à esquerda com o título, compensando o `px-2.5`); o span não precisa.

- [ ] **Step 3: Tipos/lint**

  Run: `npx tsc --noEmit && npx eslint src/app/page.tsx`
  Esperado: exit 0, sem saída.

- [ ] **Step 4: Verificar no "SIGRH Mobile" (390px)**
  Sem região: screenshot do card → "Regiões Hidrográficas do Ceará" e "11 Regiões" em uma linha cada. Depois selecionar "Baixo Jaguaribe", screenshot; depois "Médio Jaguaribe", screenshot.
  Esperado: selo em uma linha; seletor numa segunda linha, largura total, "Caracterização" e "Infraestrutura" inteiros e de mesma largura; alternar para "Infraestrutura" funciona; rodapé com título/subtítulo em cima e "Identificação →" embaixo, alinhado à esquerda; `document.documentElement.scrollWidth === 390`.

- [ ] **Step 5: Verificar no "SIGRH App" (desktop) e em ~1100px**
  Desktop com "Médio Jaguaribe": barra igual à de antes (selo à esquerda, seletor à direita, uma linha); rodapé lado a lado. Depois, se o portal permitir redimensionar (ou usando um portal temporário `--size 1100x900`, que deve ser listado ao final para o Guilherme fechar), conferir a largura `lg`: nada cortado; se o seletor quebrar de linha, fica alinhado à direita.

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/page.tsx docs/superpowers/plans/2026-10-10-home-card-tags-justificado.md
  git commit -m "fix(home): selo e seletor do card da regiao sem quebra ou corte no mobile" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
  ```

---

### Task 2: Texto justificado na home

**Files:**
- Modify: `src/app/page.tsx:132` (descrição institucional), `src/app/page.tsx:319` (subtítulo de Funcionalidades), `src/app/page.tsx:435` (`CardDescription` do `FeatureCard`)

- [ ] **Step 1: Acrescentar `text-justify [hyphens:auto]`** às classes desses três elementos. Nada mais muda (nem os avisos azuis, nem o footer institucional, nem a frase "Selecione para carregar…").

- [ ] **Step 2: Tipos/lint**

  Run: `npx tsc --noEmit && npx eslint src/app/page.tsx`
  Esperado: exit 0, sem saída.

- [ ] **Step 3: Verificar no portal**
  Desktop e 390px: screenshot do hero e da seção de funcionalidades.
  Esperado: a descrição institucional e as descrições dos cards com as duas margens alinhadas, última linha alinhada à esquerda, sem buracos grandes entre palavras nos cards em 390px (se aparecerem, reportar em vez de improvisar).

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/page.tsx
  git commit -m "style(home): justifica textos corridos seguindo o padrao do sistema" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
  ```

---

### Task 3: Push e atualização do PR #12

- [ ] **Step 1: Push**

  Run: `git push`
  Esperado: `feat/header-sem-seletor-home -> feat/header-sem-seletor-home`.

- [ ] **Step 2: Atualizar o body do PR**
  `gh pr edit 12 --body ...` acrescentando os dois itens (card da região; texto justificado) ao resumo e ao checklist de verificação, mantendo o conteúdo atual e a linha final `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
  Esperado: `gh pr view 12 --json body -q .body` mostra os novos itens.
