# Tabelas no celular, abas fixas e legibilidade — Design

**Data:** 2026-10-19 · **Status:** design aprovado no chat pelo Guilherme · **Origem:** Sprint 2 + Backlog (ClickUp), itens de prioridade alta

## Objetivo

Corrigir os três problemas de leitura mais graves apontados na revisão de UX (`ux-review/sintese-2026-10-16.md`, seções C, E e F), para o público leigo que o `PRODUCT.md` descreve:

- **A. Tabelas:** nenhuma informação cortada ou escondida em nenhuma largura de tela.
- **B. Situação Hídrica:** as abas ficam visíveis enquanto a pessoa rola a página.
- **C. Legibilidade:** todo texto com contraste mínimo de 4,5:1 (WCAG AA) e tamanho mínimo de 12px.

Itens do ClickUp cobertos:
- Planos: colunas de Investimento e Prazo cortadas (`86e3rr409`)
- Matriz e Custos: tabelas viram cards no celular (`86e3rr40a`)
- Custos: valores longos quebrando linha e KPIs desalinhados (`86e3rr40b`)
- Matriz: prioridade desconhecida aparece como 'Baixa' (`86e3rrht1`)
- Navegação: abas fixas na Situação Hídrica (`86e3rr40p`)
- Acessibilidade: contraste dos textos cinza e textos de 9–11px (`86e3rr40u`)

## Fora do escopo

Alvos de toque de 44px, sumário com âncoras, abas com duas raízes Radix, cores fixas no código (hex), reescrita de textos e qualquer mudança na API ou nos dados.

## Decisões

### A. Tabelas → cards

**A troca entre tabela e cards depende da largura da área de conteúdo, não da tela.** A barra lateral pode estar aberta (288px) ou recolhida (80px), então a mesma tela de 1280px pode ter 944px ou 1150px de conteúdo. A solução usa container queries do Tailwind v4: `@container` no envoltório da tabela e as variantes `@2xl:` / `@5xl:` / `@md:`. Isso refina o que foi combinado no chat ("cards abaixo de 768/1024px") sem mudar a intenção.

| Página | Tabela quando a área tem pelo menos | Abaixo disso |
|---|---|---|
| Planos (5 colunas) | 1024px (`@5xl`) | cards |
| Matriz (3 colunas) | 672px (`@2xl`) | cards |
| Custos, tabela de custos variáveis (2 colunas) | 448px (`@md`) | lista rótulo/valor |

- Os cards mostram **os mesmos dados**, com os mesmos filtros e a mesma paginação da tabela. Nenhum campo some.
- **Card de Planos:**
  - linha 1: eixo, em rótulo pequeno;
  - linha 2: programa;
  - corpo: a ação estratégica;
  - depois, o responsável e a tipologia;
  - no rodapé, numa linha: investimento à esquerda e prazo à direita.
- **Card da Matriz:** a ação específica em destaque, com o selo de prioridade no canto superior direito; embaixo, o programa e depois os responsáveis.
- **Lista de Custos:** cada custo variável vira um bloco com a descrição em cima e o valor embaixo, alinhado à esquerda.
- **Planos, tabela larga:** sai o `min-w-321.5`, que hoje força 1286px e corta Investimento e Prazo. As colunas ficam com Eixo/Programa 20%, Ação 32%, Responsável 18%, Investimento 16% e Prazo 14%. No Investimento, o valor não quebra (`whitespace-nowrap`) e a unidade (`/ ano` etc.) vai para a linha de baixo, menor.
- Tabelas que continuam com rolagem horizontal deixam de esconder a rolagem: sai o `max-w-[calc(100vw-3rem)] … overflow-hidden` que corta o conteúdo.

### A. Valores grandes em Custos

- **Novo formatador** `formatBRLResumido(valor: number): string`, em `src/lib/format.ts`, com o resultado em português por extenso:
  - `1306424435.38` → `R$ 1,31 bilhão`; `2500000000` → `R$ 2,5 bilhões`;
  - `245000000` → `R$ 245 milhões`; `1500000` → `R$ 1,5 milhão`;
  - `85000` → `R$ 85 mil`;
  - `950` → `R$ 950,00`, com o formato normal abaixo de mil.
  - Até 2 casas decimais, sem zeros sobrando. Singular quando a parte numérica é menor que 2.
- **Onde aparece o valor resumido:** nos KPIs "Investimento Total" e "Maior Aporte", no "Aporte Total" do banner do eixo e no card "Custo Fixo". O valor resumido fica grande e, logo abaixo, o **valor exato** (`fmtBRL`) aparece pequeno, para nada ser arredondado sem aviso.
- **Nas tabelas e listas, o valor fica exato.**
- **KPIs alinhados:** os três cards ficam com a mesma altura (`h-full`), com rótulo, valor e subtítulo alinhados entre eles.

### A. Prioridade desconhecida

`getPriorityBadge` só mostra "Baixa" quando o texto é baixa. Valor vazio ou desconhecido vira um selo neutro **"Não informada"**. Os selos ficam no estilo suave, com contraste AA:

| Prioridade | Estilo |
|---|---|
| Alta | `bg-red-50 text-red-700 border-red-200` |
| Média | `bg-amber-50 text-amber-800 border-amber-200` |
| Baixa | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| Não informada | `bg-slate-100 text-slate-600 border-slate-200` |

### B. Abas fixas na Situação Hídrica

- **Causa:** `overflow-x-hidden` no envoltório da página (`situacao-hidrica/page.tsx:217`) e `overflow-hidden` no próprio bloco `sticky` (`:241`). Os dois criam um contexto de rolagem, e com isso o `sticky` deixa de funcionar.
- **Correção:**
  - o envoltório da página passa a `overflow-x-clip`, que corta sem criar contexto de rolagem;
  - o bloco das abas perde o `overflow-hidden`;
  - o bloco fica `sticky top-0`, com fundo sólido (`bg-white/95` e `backdrop-blur`) e uma sombra leve, para não se misturar com o conteúdo que passa por baixo.
- **Celular:** as abas saem da grade 2×2 e viram uma linha única com rolagem lateral. Cada aba fica numa linha só (`whitespace-nowrap`), e a aba ativa entra na tela ao ser escolhida.
- Ao trocar de aba com a página rolada, o topo do conteúdo da aba aparece logo abaixo das abas fixas, sem ficar escondido por elas.

### C. Legibilidade (todo o `src/`)

- **Tamanho:** nenhum `text-[8px]`, `text-[9px]`, `text-[10px]` ou `text-[11px]`. Todos viram `text-xs` (12px). Espaçamentos de letra exagerados nos rótulos em caixa alta (`tracking-[0.22em]`, `[0.25em]`, `[0.3em]`) baixam para no máximo `tracking-[0.12em]`, para o rótulo não alargar demais.
- **Contraste em fundo claro** (branco, `slate-50`, `slate-100`, `gray-50`, tons `-50` de cor):
  - texto `slate`/`gray` com tom 500 ou mais escuro (`slate-300` e `slate-400` viram `slate-500`, inclusive `placeholder:`);
  - texto colorido (`blue`, `sky`, `emerald`, `amber`, `red`) com tom 600 ou mais escuro (`amber` com 700 ou mais).
- **Contraste em fundo escuro** (barra lateral `#07182d`, `bg-slate-800/900` como o banner de Custos): texto `slate` com tom 400 ou mais claro. Ou seja, `text-slate-500` sobre escuro também precisa mudar.
- **Exceções que podem ficar:** ícones decorativos, traços de "sem valor" com `aria-hidden`, bordas e fundos. Só o texto conta.
- **Movimento:** fora do escopo; fica no Backlog.

## Verificação

Gates de código:
- `npx tsc --noEmit`, `npm run lint` e `npm run build` passam.
- `grep -rnE "text-\[(8|9|10|11)px\]" src` não retorna nada.
- Cada `text-slate-300` ou `text-slate-400` que sobrar no `src` está listado no relatório, com o motivo (fundo escuro, ou ícone).

No portal, em 390, 768 e 1440px, com a barra lateral aberta e recolhida no desktop:
- Planos, Matriz e Custos sem nada cortado e sem rolagem horizontal da página.
- Na Matriz do Banabuiú e do Médio Jaguaribe, as prioridades aparecem certas. Para testar "Não informada", basta conferir o comportamento com um valor vazio no código, porque os dados atuais estão completos.
- Na Situação Hídrica, as abas ficam fixas ao rolar nas três larguras.
- Os KPIs de Custos mostram o valor resumido e o exato, alinhados.

## Riscos

- **Volume da mudança C:** são cerca de 120 trocas de classe em vários arquivos, e quase todas são troca mecânica. O risco é um texto sobre fundo escuro ficar escuro demais. A regra de fundo escuro e a verificação no portal cobrem isso.
- **Container queries:** exigem Tailwind v4, que o projeto já usa. Funcionam em todos os navegadores atuais.
