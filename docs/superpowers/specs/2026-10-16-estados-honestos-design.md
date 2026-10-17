# Estados Honestos — o que aparece na tela é verdade

Sub-projeto 1 de 5 da revisão de UX de 2026-10-16 (impeccable critique + audit). Os outros (tabelas/mobile, linguagem, navegação, acessibilidade/consistência visual) terão specs próprias.

## Objetivo

Nenhuma página do SIGRH mostra dado inventado, dado de outra região, dado errado vindo da importação, ou "sem dados" quando na verdade houve falha. O público é amplo e não técnico (PRODUCT.md): o que ele lê na tela, ele toma como fato do plano oficial.

## Decisões do Guilherme

- Correções de dados (back) entram neste sub-projeto.
- Monitoramento continua visível, com estado honesto (opção B).
- Indicadores continua fora do menu (não há dados reais).
- Matriz das 5 regiões com fonte quebrada fica "indisponível" até chegarem os documentos originais (task registrada para o Guilherme).
- Arquitetura: componente compartilhado + API que propaga erro (opção A). Sem biblioteca nova.

## Fora de escopo

Layout de tabelas no mobile, reescrita de rótulos/glossário, texto justificado, abas fixas e sumários, contraste/acessibilidade, tokens de cor. Inconsistências numéricas da Situação Hídrica (9 x 10 adutoras; 435 mi x 7,37 bi m³) dependem do plano oficial e estão com o Guilherme.

---

## 1. Base: estados de dados

### 1.1 `src/services/api.ts`

- `getActions`, `getMatriz`, `getCustos`, `getReservoirs` deixam de capturar erro e devolver `[]`/`null`: o erro é propagado ao chamador.
- Remover os `console.log` de debug do topo do módulo.
- Funções que já propagam (`getSections`, `getKpis`, `getRadarData`, `getConsolidated`, `getBasins`) não mudam.

### 1.2 Componente `src/components/data-state.tsx`

```ts
type DataStatus = "loading" | "error" | "empty" | "unavailable" | "ready";

interface DataStateProps {
  status: DataStatus;
  onRetry?: () => void;          // usado em "error"
  onClearFilters?: () => void;   // usado em "empty" quando há filtros
  unavailableReason?: string;    // parágrafo explicativo em "unavailable"
  regionName?: string;
  children?: React.ReactNode;    // renderizado em "ready"
}
```

| status | Conteúdo (copy exato) |
|---|---|
| `loading` | Indicador discreto restrito à área de dados, com texto "Carregando…". Nunca substitui a página inteira. |
| `error` | "Não foi possível carregar os dados desta região." + botão "Tentar novamente" (`onRetry`). |
| `empty` | "Nenhum resultado para estes filtros." + botão "Limpar filtros" quando `onClearFilters` existir. |
| `unavailable` | "Este conteúdo ainda não está disponível no sistema para a região {regionName}." + `unavailableReason`. |
| `ready` | `children`. |

Visual segue o sistema atual (cores, raio, tipografia das páginas); não é escopo redesenhar.

### 1.3 Regras para as páginas

- Título, cabeçalho, filtros e posição de rolagem permanecem montados durante `loading` e após `error`.
- Trocar filtro mostra `loading` só na área da lista/tabela.
- Cada busca guarda um identificador da requisição (região + filtros); resposta que chega depois de a região/filtro mudar é descartada. Implementação simples (contador ou flag de cancelamento no `useEffect`), sem dependência nova.
- Páginas que adotam: Home (mapa da região), Identificação, Metodologia, Situação Hídrica, Matriz, Planos, Monitoramento, Custos.
- Indicadores (fora do menu): sem região, mostrar `SelectRegionPrompt` em vez de spinner infinito. Nenhuma outra mudança.

## 2. Matriz de Ação

### 2.1 Back (`regioes-hidrograficas-api`)

Arquivos: `cmd/seeder/plano_financeiro.go` (`importarMatrizJSON`), `internal/api/handler/financeiro.go` (`GetMatriz`).

1. Linha do `matriz_acao.json` com "Ações específicas" vazia não é importada.
2. Importação por região: apagar as linhas de `matriz_acoes_prioridade` da região e inserir todas as linhas válidas na ordem do arquivo (sem `FirstOrCreate` por programa+ação).
3. `TipoMatriz` normalizado para um dos 5 eixos, por palavra-chave (sem diferenciar maiúsculas/acentos):
   - "demanda" → `Eixo Demanda Hídrica`
   - "oferta" → `Eixo Oferta Hídrica`
   - "gerenciamento" → `Eixo Gerenciamento das Águas`
   - "político" / "politico" → `Eixo Político-Institucional`
   - "ambient" → `Eixo Aspectos Ambientais`
   O texto original continua disponível (novo campo `tipo_matriz_original` ou equivalente; o nome fica a critério do Back, documentado no PR).
4. Prioridade: "Baixo" → "Baixa".
5. `GetMatriz` ordena por `id`.
6. Reimportar no banco local.

Resultado esperado na API (`/api/v1/financeiro/matriz?basin_id=N`):

| Região | id | Linhas |
|---|---|---|
| Coreaú | 5 | 99 |
| Crateús | 4 | 60 |
| Curu | 6 | 74 |
| Ibiapaba | 7 | 60 |
| Litoral | 8 | 83 |
| Salgado | 11 | 91 |
| Alto Jaguaribe, Baixo Jaguaribe, Banabuiú, Metropolitana, Médio Jaguaribe | 1, 2, 3, 10, 9 | 0 |

Todas as linhas com `acoes_especificas` preenchida e `prioridade` ∈ {Alta, Média, Baixa}; `tipo_matriz` ∈ os 5 eixos.

### 2.2 Front (`src/app/matriz/page.tsx`)

- Lista vazia sem filtros → `unavailable`, `unavailableReason`: "A Matriz de Ação desta região ainda está sendo incorporada ao sistema a partir do plano oficial."
- Lista vazia com filtros → `empty` com "Limpar filtros".
- Falha → `error`.
- Filtro "Tipo de Matriz" passa a listar os eixos normalizados, rotulado "Eixo" (nome final no sub-projeto de linguagem).

## 3. Monitoramento

### 3.1 Back (`cmd/seeder/monitoring.go`)

- Criar `Measurement` somente quando a coluna "Metrica de Indicador de execução" da planilha estiver preenchida (célula vazia ≠ 0).
- Na reimportação, remover as medições criadas sem métrica. Resultado esperado hoje: nenhuma ação, em nenhuma região, com `measurements` não vazio.
- O cálculo de IEA relativo continua igual para as medições que existirem.

### 3.2 Front (`src/app/monitoramento/page.tsx`)

- Se nenhuma ação da região (sem filtros aplicados) tem medição: aviso informativo no topo, copy exato:
  "O acompanhamento da execução destas ações ainda não começou. As ações e prazos abaixo são os previstos no plano; o status de cada uma aparecerá aqui quando as medições forem registradas."
- Coluna "Status Execução", pela última medição da ação:

| Situação | Exibição |
|---|---|
| Sem medição | "Sem medição registrada", cinza neutro, sem barra, sem pulso |
| `execution_perc` = 0 | "Não iniciada" |
| 0 < `execution_perc` < 100 | "Em andamento" + barra com largura = percentual real |
| `execution_perc` ≥ 100 | "Concluída" |

- Coluna "IEA Rel.": sem medição → "—"; com medição → valor real formatado.
- Remover: status, pulso e barra 60% fixos; "ID: #<id>" visível ao público.
- Loading/erro/vazio via `DataState`.

## 4. Metodologia, Situação Hídrica, Identificação, Home

### 4.1 Metodologia (`src/app/metodologia/page.tsx`)

- Texto da seção nível 1: todos os parágrafos. Com mais de 2 parágrafos, os 2 primeiros visíveis e o restante atrás de "Ler texto completo" (expande no lugar; alterna para "Mostrar menos").
- `getSmartSummary` não inventa texto: sem conteúdo na fase nem na primeira subseção, a fase mostra só título e atividades.
- Dialog "Ver detalhes da fase" inclui o texto completo da própria fase antes das subseções.
- Sem imagem: não renderizar o bloco de imagem (remover "Mockup da Aplicação Geral" e "Espaço para Foto - {título}"); o texto ocupa a largura.

### 4.2 Situação Hídrica e Identificação

- Correspondência de seções por prefixo com separador: filho de "3.1" é `number.startsWith("3.1.")`; capítulo "1" é `number === "1" || number.startsWith("1.")`. Aplicar em `situacao-hidrica/page.tsx` (filtro de capítulo da aba e de níveis 3/4) e `identificacao/page.tsx`.
- "Nenhum dado encontrado para esta bacia." → `DataState` (`empty`/`error` conforme o caso).

### 4.3 Home (`src/app/page.tsx`)

- Região selecionada e falha ao carregar o mapa: no lugar das capas genéricas, "Não foi possível carregar o mapa desta região." + "Tentar novamente". As capas gerais continuam sendo o estado sem região.

## 5. Entrega

- Back: branch `fix/importacao-matriz-medicoes` em `regioes-hidrograficas-api`, PR para a branch padrão do repo; reimportação local feita pelo Back.
- Front: branch `feat/estados-honestos` em `regioes-hidrograficas-web`, PR para `dev`.
- Os dois PRs são independentes: o front já trata Matriz vazia como indisponível e medições vazias como "sem medição".

## 6. Verificação (feita pelo orquestrador no portal, 1440px e 390px)

1. Matriz: Coreaú e Salgado com ação, responsáveis e prioridade corretos e filtro com 4–5 eixos; Médio Jaguaribe em `unavailable`.
2. Monitoramento: aviso no topo, "Sem medição registrada" e "—" em todas as linhas; nenhum 60%, pulso ou "ID: #".
3. `docker stop regioes_api`: todas as 8 páginas mostram `error` mantendo título/filtros; `docker start regioes_api` + "Tentar novamente" carrega os dados.
4. Troca rápida de região (duas seleções seguidas): a página termina com os dados da última região.
5. Trocar filtro em Planos e Monitoramento não desmonta a página nem perde a rolagem.
6. Metodologia: texto completo do nível 1, sem texto inventado, sem placeholders.
7. Situação Hídrica e Identificação mostram as mesmas seções de antes para Médio Jaguaribe (nenhuma regressão do ajuste de prefixo).
8. `npx tsc --noEmit`, `npx eslint` nos arquivos alterados sem erros novos; `go build ./...` e `go vet ./...` limpos.
