# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Ainda não há um usuário principal definido (decisão em aberto). O público-alvo é amplo: qualquer pessoa interessada nas informações dos planos das regiões hidrográficas do Ceará — de técnicos e membros de comitês a cidadãos sem formação técnica. Projetar para quem não é especialista é o caso de referência; o técnico não pode ser prejudicado por isso.

## Product Purpose

O SIGRH (Sistema de Informações de Gestão das Regiões Hidrográficas do Ceará) democratiza o acesso às informações dos planos das 11 regiões hidrográficas do Ceará. Hoje esse conteúdo vive em planos estáticos (documentos/PDFs); o sistema o traz para uma interface navegável, por região, com acesso fácil para quem tiver interesse.

Sucesso: uma pessoa sem familiaridade com os planos consegue escolher sua região e entender a situação hídrica, as ações planejadas, os custos e o monitoramento sem precisar abrir os documentos originais.

## Positioning

O conteúdo dos planos oficiais das regiões hidrográficas do Ceará, reorganizado por região e por tema em uma única plataforma consultável — em vez de documentos estáticos separados.

## Operating Context

- Tudo parte da escolha de uma região hidrográfica (11 regiões; seleção global no topo e no corpo da home). Sem região selecionada, os módulos pedem a seleção.
- Três usos com peso parecido: consultar o diagnóstico de uma região, acompanhar planos/ações/custos, e apresentar os dados em reuniões e oficinas.
- Módulos: Identificação, Metodologia, Situação Hídrica (contexto); Matriz de Ação, Planos de Ação, Monitoramento, Previsão de Custos (planejamento); Indicadores.
- Uso em desktop e celular.

## Capabilities and Constraints

- Front-end Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI/shadcn, Recharts, Lucide.
- Dados vêm da API Go (`/api/v1`: bacias, conteúdo, dashboard/radar, consolidado, ações, matriz, custos, KPIs) e de imagens servidas pela API (`/assets`).
- Idioma: português do Brasil (`<html lang="pt-BR">`); textos corridos justificados com hifenização é o padrão vigente do sistema.
- Terminologia: "região hidrográfica" (não "bacia" na interface), "Matriz de Ação", "Planos de Ação", "Previsão de Custos", "Situação Hídrica".

## Brand Commitments

Nenhum compromisso institucional formal por enquanto (identidade de governo, órgão gestor ou padrão de acessibilidade obrigatório ainda não definidos). A identidade atual do SIGRH (nome, logos em `public/logos/`) é a referência existente.

## Evidence on Hand

- Capas dos diagnósticos das 11 regiões: `public/logos/capasrh.png` / `capasrh.svg`.
- Logos: `public/logos/logo-rh.svg`, `public/logos/logo-isolada.svg`.
- Conteúdo textual, imagens e dados reais de cada região via API (originados dos planos oficiais).
- Não há depoimentos, métricas de uso, parceiros ou órgãos signatários confirmados — não inventar.

## Product Principles

1. Acesso antes de especialização: qualquer pessoa interessada deve entender o que vê sem conhecer os planos.
2. A região é o ponto de partida: toda informação é lida no contexto de uma região escolhida.
3. Fidelidade aos planos: o sistema apresenta o conteúdo oficial; não simplifica a ponto de distorcer nem acrescenta afirmações.
4. Serve igualmente a consulta, acompanhamento e apresentação.

## Accessibility & Inclusion

Sem padrão obrigatório definido (eMAG/WCAG não exigidos formalmente). Como o objetivo é democratizar o acesso a um público amplo e não técnico, legibilidade, linguagem clara e uso no celular são requisitos de produto.
