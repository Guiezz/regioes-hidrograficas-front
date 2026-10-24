# Home com mapa interativo das regiões hidrográficas — Design

**Data:** 2026-10-24 · **Escopo:** só front, só a página inicial (`src/app/page.tsx`)

## Problema

O card à direita da home mostra a grade das 11 capas dos planos (e, depois de escolher a região, imagens da vista e da infraestrutura). Visualmente destoa do resto do site, e as imagens de caracterização/infraestrutura já existem na página **Identificação**, ou seja, são redundantes na home. A seleção da região também fica em um dropdown grande separado do visual.

## Decisão

Trocar o card por um **mapa SVG interativo do Ceará**, colorido por região com as cores das logos dos planos. O mapa é o seletor principal; uma lista (desktop) ou um seletor (celular) fica sincronizada com ele. Depois de escolher, a pessoa vê o nome da região e um único botão **Explorar região** que leva à Identificação.

Fora da home: nada muda. `ReservoirContext`, API, rotas e as demais páginas ficam como estão.

## Comportamento

- **Mapa:** 11 regiões clicáveis + 1 forma decorativa em cinza claro (`#C9D1DB`), sem hover, clique, foco, rótulo ou menção em lugar nenhum (código, textos, aria, comentários).
- **Hover/foco (desktop):** a região sob o cursor destaca; as outras escurecem para opacidade 0,22. Clique/toque seleciona.
- **Selecionada:** região destacada com contorno branco ~9 unidades do viewBox; demais opacidade 0,22; a forma cinza vai a 0,5. Clicar de novo na mesma região mantém a seleção (não há "desselecionar").
- **Painel de resultado:** sem seleção mostra "Passe o mouse ou toque em uma região" (desktop mostra o nome em hover). Com seleção: nome da região, rótulo "Região selecionada" e botão **Explorar região** → `/identificacao?basin_id=<id>`.
- **Removidos da home:** card de capas, alternância Caracterização/Infraestrutura, busca de imagens (`getSections`/`useAsyncData`), dropdown grande, botões "Acessar Situação Hídrica" e "Ver Previsão de Custos". Mantém-se um link discreto **Conhecer a metodologia** (mesmo destino que o site já usa para isso), título com gradiente, parágrafo e grade de módulos.
- **Estado:** continua em `useReservoir()`. O mapa chama `setSelectedReservoir(reservoir)`; a URL ganha `?basin_id=` como hoje. Voltar do navegador mantém sincronia (já resolvido pelo contexto).
- **Carregando / erro:** enquanto `isLoading`, mapa visível porém inerte (opacidade 0,5, sem cursor de clique) e seletor em skeleton. Em `loadError`, mostrar a mensagem e "Tentar novamente" de `ReservoirSelector` (reaproveitar o componente na versão celular; ver abaixo) e o mapa fica inerte.

## Layout

> **Decisão do Guilherme em 2026-10-24 (substitui o layout em duas colunas e a ordem anterior do celular).**

**Ordem de conteúdo em todas as larguras:** título → parágrafo → dica "Escolha uma região no mapa…" → bloco do mapa (mapa + seletor/lista + painel com "Explorar região") → link "Conhecer a metodologia".

**Celular (< lg):** coluna única nessa ordem; o mapa deixa de ficar na primeira dobra (aceito). Dentro do bloco: mapa (legenda "Toque em uma região") → "ou escolha pela lista" + seletor único → painel de resultado.

**Desktop (≥ lg):** layout em linhas, também acima de 2xl (as duas colunas deixavam o mapa pequeno). Bloco de texto na largura toda (título em no máximo 3 linhas, parágrafo com `max-w-3xl`, dica); depois uma linha com o mapa à esquerda (~55% da largura, mínimo 420px) e, à direita, o painel de resultado seguido da lista das 11 regiões (bolinha da cor, ativa com fundo `#E4EFFB` e `aria-pressed`); por fim o link da metodologia.

**Seletor no celular:** `<select>` nativo dentro do `RegionPicker` com só as 11 regiões e o nome oficial (o `ReservoirSelector` fica só para carregando/erro), para não alterar o componente compartilhado.

## Arquitetura

Novos arquivos em `src/components/home/` e `src/lib/`:

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/regions.ts` | Lista fixa das 11 regiões: `key`, `label`, `color`, índice no SVG. Função pura `matchRegions(apiRegions)` que casa cada região fixa com o item da API por nome normalizado. |
| `src/components/home/ceara-map-paths.ts` | `d` de cada região (gerado do SVG original) + viewBox + `d` da forma decorativa. Sem lógica. |
| `src/components/home/CearaRegionsMap.tsx` | SVG controlado: props `{ regions, activeKey, hoverKey, onHover, onSelect, disabled }`. Paths `aria-hidden`; sem lógica de dados. |
| `src/components/home/RegionPicker.tsx` | Compõe mapa + lista/seletor + painel de resultado; liga a `useReservoir()`. |
| `src/app/page.tsx` | Remove o que foi listado e usa `RegionPicker`. |

### Casamento SVG ↔ API

A API devolve só `{ id, name }`. O casamento é por **nome normalizado** (minúsculas, sem acento, sem prefixo "região hidrográfica") contra a `key` fixa da região (ex.: `medio jaguaribe`, `sertoes de crateus`, `bacias metropolitanas`). Regras:
- Região fixa sem item na API fica **desabilitada** (mapa e lista), com `console.warn` em dev.
- Item da API sem região fixa **é ignorado** (não aparece em lugar nenhum da home).
- Ambiguidade (dois itens casando a mesma chave): usa o primeiro e avisa em dev.

> **Confirmado em 2026-10-24 (`GET /basins` de produção):** ids 1–11 = Alto Jaguaribe, Baixo Jaguaribe, Banabuiú, **Crateús**, Coreaú, Curu, **Ibiapaba**, Litoral, Médio Jaguaribe, **Metropolitana**, Salgado. Por isso cada região fixa aceita **uma lista de nomes** (oficial + nome curto da API): `sertoes de crateus` | `crateus`, `serra da ibiapaba` | `ibiapaba`, `bacias metropolitanas` | `metropolitana`. **Na home o rótulo exibido é sempre o nome oficial** (decisão do Guilherme), mesmo que o seletor das outras páginas mostre o nome da API.

### Mapeamento forma → região (ordem dos 12 paths coloridos do arquivo `docs/superpowers/assets/mapa_ceara_vetor.svg`, após o contorno branco)

| # | Região | Cor |
|---|---|---|
| 1 | Alto Jaguaribe | `#569F4A` |
| 2 | Banabuiú | `#784421` |
| 3 | Sertões de Crateús | `#B26B45` |
| 4 | Bacias Metropolitanas | `#4D4D4D` |
| 5 | forma decorativa (cinza, não selecionável) | `#C9D1DB` |
| 6 | Salgado | `#D4AA00` |
| 7 | Coreaú | `#672178` |
| 8 | Médio Jaguaribe | `#242868` |
| 9 | Curu | `#1187D0` |
| 10 | Litoral | `#FF801A` |
| 11 | Baixo Jaguaribe | `#D40000` |
| 12 | Serra da Ibiapaba | `#008001` |

Este mapeamento foi **inferido pela geografia**; a primeira tarefa de verificação do plano é conferir visualmente cada forma ao passar o mouse.

## Acessibilidade

- Os paths do mapa são `aria-hidden`; a interação acessível é a lista (botões com `aria-pressed`) / seletor. O mapa ainda aceita clique/toque para quem enxerga.
- Alvos de toque ≥ 44px na lista e no seletor; as formas do mapa são grandes o bastante no celular (SVG ocupa a largura toda).
- Cores nunca são a única informação: nome sempre escrito no painel e na lista.
- Contraste AA do texto sobre o fundo claro (regra do repo: slate ≥ 500); respeitar `prefers-reduced-motion` nas transições de opacidade.
- `Tab` percorre a lista; `Enter/Space` seleciona.

## Riscos e questões abertas

1. **Nomes/ids reais da API** não foram verificados (só o tipo `{id:number,name:string}`). Mitigação: casamento por nome normalizado, com aviso em dev. Pedir ao dono o retorno de `GET /basins` antes de implementar para fixar as chaves.
2. **Mapeamento forma→região inferido** (acima). Verificação visual obrigatória.
3. **Tamanho do bundle:** os paths somam ~50 KB de string; aceitável, mas manter em módulo próprio (carregado só na home) e checar o `next build`.
4. **Selecionar mapa dispara `router.push`** a cada clique (comportamento atual do contexto); aceitável.

## Fora de escopo

Header (já oculto em `/`), outras páginas, mudanças de API, novas rotas, a forma decorativa virar selecionável.

## Verificação

`npx tsc --noEmit`, `npm run lint`, `npm run build` (CI) + conferência manual: desktop 1280 e celular 390×844 com `?basin_id=<id>` pré-selecionando a região; teclado; estado de erro da API.
