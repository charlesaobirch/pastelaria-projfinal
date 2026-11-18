# Plano de construção — Projeto final (pastelaria)

Plano técnico e de execução para a app React do projeto final, a partir do
briefing `final_project.html` e dos dados já analisados em
[`analise/RELATORIO.md`](./analise/RELATORIO.md).

- **Início:** 17/11/2026, 13h · **Entrega:** 24/11/2026, de manhã
- **Peso da nota:** app React 40 % · análise 30 % · apresentação 20 % · slides 10 %
- **Restrição dura:** sem backend. JSON estático + React. Ficheiros só de leitura.
- **Equipa:** 3 pessoas.
- **Estado do repo:** Next.js 16.4.6 + React 19.3 + Tailwind 4 + Biome, `cacheComponents: true`.
  `src/app` ainda é o scaffold. **Dados prontos** em `public/data/` (21 produtos, 16 ingredientes,
  4 583 vendas), validados contra o xlsx e com tipos corrigidos.

---

## 1. O que o enunciado exige (checklist)

| # | Exigência | Como cumprimos |
|:--|:--|:--|
| 1 | Ler os dados de JSON **dentro do React** | `fetch('/data/*.json')` em `services/data.ts`, uma vez por sessão |
| 2 | Transformar linhas em informação útil | `lib/` com funções puras (KPIs, rankings, séries) |
| 3 | Pelo menos uma forma de ver a informação | 6 ecrãs com gráficos, tabelas e cartões |
| 4 | Escolher a app que o negócio precisa | Painel de decisão para o dono da pastelaria |
| 5 | Sem backend, ficheiros só de leitura | Nenhuma escrita; estado só em memória |
| 6 | Cabeçalhos do Excel = chaves do JSON; datas como texto | Tipos espelham as chaves; parsing explícito em `lib/dates.ts` |
| 7 | `lib/` puro, `services/` com fetch, `hooks/`, Zustand, Recharts | Estrutura da secção 4 |

### O que o enunciado **não** obriga

Não há ecrãs obrigatórios, número de páginas, tema visual nem biblioteca de UI.
O layout fica para a fase 2 (secção 7), por decisão explícita.

---

## 2. Estado atual e lacunas

| Item | Estado | Ação |
|:--|:--|:--|
| Next.js / Tailwind / Biome | ✅ instalado e a compilar | — |
| Análise dos dados | ✅ `docs/analise/` (27 CSVs, 10 gráficos, relatório) | reutilizar números e conclusões |
| `public/data/*.json` | ✅ movidos e normalizados | nada — `scripts/preparar_dados.py` valida |
| `src/app` | ⚠️ scaffold do create-next-app | substituir na fase 1 |
| Tipos, serviços, `lib/`, store | ❌ não existe | Fase 0 |
| Zustand, Recharts | ❌ não instalados | `npm i zustand recharts` |
| 4 branches (`main`, `Charles`, `Andrey`, `Jonathan`) | ✅ sincronizadas | contratos primeiro, depois paralelo |

> O xlsx não é servido ao browser nem precisa de ir para o repo: o que a app lê
> são os três JSON de `public/data/`, que já fecham com os totais do relatório.

---

## 3. Conceito do produto

**“Balcão” — painel de decisão da pastelaria.** O dono abre a app e responde a
quatro perguntas em menos de um minuto: *quanto ganhei, o que dá lucro, quando
vendo e o que está a faltar.*

O diferencial não é desenhar gráficos — é cada ecrã terminar numa decisão. A
análise já produzida dá a matéria-prima:

| Insight (dos dados) | Ecrã onde vive | Decisão que suporta |
|:--|:--|:--|
| Lucro bruto 8 319,78 € · margem 73,0 % | Visão geral | saber o ponto de partida |
| 5 produtos = 46,6 % do lucro; 13 = 80 % | Produtos / Rentabilidade | onde proteger stock e atenção |
| Bebidas: 39,3 % da receita, 42,6 % do lucro | Rentabilidade | mix a empurrar |
| Fim de semana +47,6 %/dia (p = 0,000) | Vendas no tempo | reforço de pessoal sáb–dom |
| 7–9h = 32,6 % da receita; picos 13h e 16h | Vendas no tempo | escalas e reposição |
| Cartão 48,7 % · estável (p = 0,50) | Pagamentos | sem ação; transparência |
| 5 ingredientes abaixo do mínimo | Stock | compras desta semana |
| 2025 vs 2026 não é comparável | Nota metodológica | não decidir com +417 % falso |

### Ecrãs propostos (navegação)

| Rota | Nome | Conteúdo mínimo | Prioridade |
|:--|:--|:--|:--|
| `/` | Visão geral | 4 KPIs (receita, lucro, margem, unidades), receita mensal, top 5 lucro, 2–3 alertas | P0 |
| `/vendas` | Vendas no tempo | série diária, receita por dia da semana, horas, heatmap dia×hora, top dias, **pagamentos** | P0 |
| `/produtos` | Produtos | tabela pesquisável/ordenável: unidades, receita, lucro, margem, % do total | P0 |
| `/produtos/[id]` | Detalhe do produto | ficha + evolução mensal + comparação com a categoria | P0 |
| `/stock` | Stock e ingredientes | alertas (esgotado/baixo/ok), valor por fornecedor, cobertura vs mínimo | P0 |
| `/simulador` | Simulador de preço | “e se +10 %?” com aviso de volume constante | P1 |

Com 3 pessoas e 6 dias, os 5 ecrãs **P0** são o compromisso; o simulador só
entra depois de os P0 estarem fechados. Se o tempo apertar, passa a secção de
`/produtos` em vez de rota própria.

Pagamentos entra como **secção de `/vendas`** (não vale uma rota própria: 3
categorias e uma conclusão de estabilidade). Método e limitações entram num
`/sobre` curto ou num rodapé expansível — alimenta a apresentação.

**Fora de âmbito (por agora):** autenticação, escrita, exportação, multi-loja,
previsão. Se sobrar tempo, exportar CSV é o primeiro extra.

---

## 4. Arquitetura

```
pastelaria.xlsx
   │  (script, uma vez)
   ▼
public/data/{produtos,ingredientes,vendas}.json
   │  fetch  (services/data.ts)
   ▼
store (Zustand)  ──►  hooks  ──►  componentes  ──►  ecrã
   ▲                    │
   └──── lib/ (puro) ◄──┘
```

```
src/
├─ app/
│  ├─ layout.tsx                 server: shell, nav, metadata, fontes
│  ├─ page.tsx                   Visão geral
│  ├─ vendas/page.tsx
│  ├─ produtos/page.tsx
│  ├─ produtos/[id]/page.tsx
│  ├─ stock/page.tsx
│  └─ simulador/page.tsx
├─ components/
│  ├─ ui/          KpiCard, Card, Badge, DataTable, SearchInput, Select,
│  │               EmptyState, Skeleton, PageHeader
│  ├─ charts/      RevenueLine, MonthBars, WeekdayBars, HourBars,
│  │               DayHourHeatmap, CategoryDonut, MarginScatter
│  ├─ domain/      ProductTable, ProductDetail, StockTable, PaymentSplit,
│  │               PriceSimulator
│  └─ layout/      AppShell, Nav
├─ hooks/          useData, useFilteredSales, useKpis, useProductStats
├─ lib/            dates, stats, filters, stock, format
├─ services/       data.ts
├─ store/          useDataStore, useFilters
├─ types/          index.ts
└─ scripts/        preparar_dados.py (valida e normaliza os JSON)
```

Regras que não se quebram:

1. **`lib/` não faz fetch** e não lê o store. Entra array, sai número.
2. **`services/` é o único sítio com `fetch`.**
3. Componentes de gráfico **não calculam** — recebem dados já prontos.
4. `"use client"` só onde há estado/eventos. `layout.tsx` e as páginas-wrapper ficam server.
5. Um ecrã = uma composição; lógica nunca dentro do JSX.

### Notas do Next 16.4.6 (este repo)

- `cacheComponents: true` já está ligado: não usar `"use cache"` (não temos dados
  de servidor) e não depender de cache implícita de `fetch`.
- Não há Server Actions nem route handlers: os JSON são estáticos.
- `params` de rota dinâmica é `Promise` em server components; como o detalhe é
  cliente, ler com `useParams()` — e **descodificar** (`decodeURIComponent`).
- Ver `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
  antes de mexer em fetching.

---

## 5. Contratos partilhados (fechar antes de ramificar)

Esta é a peça que evita 4 branches a inventarem nomes diferentes.

```ts
// src/types/index.ts — chaves iguais às do JSON (cabeçalhos do Excel)
export interface Produto {
  id: number; name: string; category: string;
  unit_price: number; cost_price: number; stock: number; min_stock: number;
}
export interface Ingrediente {
  id: number; name: string; category: string; unit: string;
  unit_cost: number; stock: number; min_stock: number; supplier: string;
}
export interface Venda {
  id: number; date: string; hour: number; product_id: number;
  quantity: number; unit_price: number; payment_method: string;
}
```

```ts
// src/lib — assinaturas combinadas (implementação livre, nomes fixos)
dates.ts   parseDate(iso): Date · monthKey(d): string · weekdayIndex(d): number
           monthLabel(key): string · lastNDays(dates, n): [from, to]
stats.ts   kpis(vendas, produtos) · revenueByMonth(vendas) · revenueByWeekday(vendas)
           revenueByHour(vendas) · productStats(vendas, produtos) · categoryStats(...)
           paymentStats(vendas) · pareto(productStats)
filters.ts filterSales(vendas, { from, to, category, payment })
stock.ts   stockStatus(item): "esgotado" | "baixo" | "ok"
           stockAlerts(ingredientes) · stockValueBySupplier(ingredientes)
format.ts  eur(n) · pct(n) · int(n)      // pt-PT, 2 casas, "11 389,70 €"
```

```ts
// store
useDataStore   { produtos, ingredientes, vendas, status, error, load() }
useFilters     { from, to, category, payment, search, set(...), reset() }
```

`useDataStore.load()` corre **uma vez** (guardado no próprio store); as páginas
apenas consomem. Navegar entre rotas não repete o fetch.

---

## 6. Dados: prontos e validados

Os três JSON já estão em `public/data/` e foram verificados contra o xlsx.

| Verificação | Resultado |
|:--|:--|
| Linhas | 21 produtos · 16 ingredientes · 4 583 vendas |
| Chaves = cabeçalhos do Excel | ✅ mesma ordem nos três ficheiros |
| Valores = células do Excel | ✅ 0 diferenças de conteúdo |
| Datas como texto `"2025-11-01"` | ✅ todas as 4 583 |
| Nulos / ids duplicados / órfãos | 0 / 0 / 0 |
| Totais | receita 11 389,70 € · 7 643 un · lucro 8 319,78 € |
| Tamanho | `vendas.json` 744 KB (restantes < 4 KB) |

**Defeito corrigido na importação:** os ficheiros recebidos traziam **todos os
campos numéricos como texto** (`"id": "1"`, `"unit_price": "2.8"`, `"hour": "10"`)
— exatamente a armadilha do slide 30. `scripts/preparar_dados.py` converte-os
para `number` (22 915 campos em `vendas`), mantém as datas como texto e falha se
os totais não fecharem. É idempotente: correr outra vez dá 0 conversões.

Se um dia os JSON de origem mudarem, correr:

```bash
python scripts/preparar_dados.py
```

**Impacto para a app:** o `fetch` devolve tipos corretos e nenhuma página
precisa de `Number(...)` defensivo. Ainda assim, `services/data.ts` valida a
forma da primeira linha — se um número voltar entre aspas, falha alto em vez de
mostrar `NaN` silencioso.

---

## 7. Fases e calendário

Datas reais: 6 dias úteis (18 a 23/11), entrega na manhã de 24/11.

| Fase | Quando | Objetivo | Pronto quando |
|:--|:--|:--|:--|
| **0. Fundação** | 18/11 (hoje) | tipos, `services/`, `lib/` base, store, tokens visuais | `npm run dev` mostra 4 KPIs reais do JSON |
| **1. Esqueleto** | 19/11 | App shell + nav + as 5 rotas P0 a renderizar | navegação completa sem erros de consola |
| **2. Ecrãs core** | 20–21/11 | Visão geral, Produtos (+detalhe), Vendas no tempo | 3 ecrãs completos com gráficos Recharts |
| **3. Ecrãs de apoio** | 22/11 | Stock, secção de pagamentos, `/sobre` | todos os ecrãs com dados reais |
| **4. Polimento** | 23/11 | loading/erro/vazio, responsivo, acessibilidade, `biome` + `build` | build limpo, revisão visual feita |
| **5. Entrega** | 23/11 fim / 24/11 manhã | slides + ensaio + tag/PR | apresentação cronometrada |

**Decisão de layout = Fase 0, não depois.** Sem ela, 3 pessoas desenham 3
estilos. Escolher uma direção (sidebar vs topo, densidade, paleta) e um
`design-system` mínimo (tokens de cor/espaço/tipo) antes de codar ecrãs.

### Repartição (3 pessoas)

| Workstream | Dono | Ecrãs / ficheiros | Também |
|:--|:--|:--|:--|
| **A · Fundação** | Charles | `types`, `services`, `lib/*`, `store`, `components/ui`, `app/layout.tsx`, `/` | capitão de merge; tokens visuais |
| **B · Produtos** | Andrey | `/produtos`, `/produtos/[id]`, `/stock`, `ProductTable`, `MarginScatter`, `StockTable` | liga `lib/stats` e `lib/stock` |
| **C · Tempo** | Jonathan | `/vendas`, gráficos temporais, `PaymentSplit`, `/simulador` (P1) | slides + ensaio |

Cada pessoa tem um ecrã P0 “seu” mais a sua parte da fundação. A é o gargalo
na fase 0: assim que os contratos estiverem em `main`, B e C arrancam.

Integração: A fecha os contratos e faz merge em `main` **primeiro**; B e C
ramificam de `main` e tocam só nas suas pastas. `components/ui` é de A —
pedidos por PR pequeno, não edição concorrente. Ninguém faz merge às 23h.

**Regra de bolso para 3 pessoas:** quando um ecrã atrasa, corta-se o P1 —
nunca se corta o polimento. Uma app de 5 ecrãs bem acabada vale mais (40 %)
do que 7 ecrãs a meio.

---

## 8. Skills por fase

| Fase | Skill | Uso concreto |
|:--|:--|:--|
| 0 | `nextjs-app-router-patterns` | estrutura de rotas/layouts, server vs client |
| 0 | `nextjs-zustand` | store, selectors, evitar re-render e hydration |
| 2–3 | `recharts` | escolha de gráfico, responsiveness, tooltips |
| 2–4 | `design-system` | tokens, escala tipográfica, componentes |
| 4 | `impeccable` | hierarquia, contraste, estados vazios, mobile |
| 4 | `ponytail` | cortar âmbito e código morto antes da entrega |
| slides | `design-system` | consistência visual da apresentação |

`data-analysis` e `exploratory-data-analysis` já foram usadas e o resultado está
em `docs/analise/` — não repetir a análise; **citar**.

---

## 9. Riscos e armadilhas

| # | Risco | Mitigação |
|:--|:--|:--|
| 1 | 3 branches divergem | contratos da secção 5 fechados na fase 0; cada um só na sua pasta |
| 2 | JSON de origem com tipos errados | ✅ resolvido: `scripts/preparar_dados.py` normaliza e valida |
| 3 | Datas como texto | `parseDate` manual (`new Date(y, m-1, d)`), nunca `new Date("YYYY-MM-DD")` a seco |
| 4 | “Últimos 30 dias” a contar de hoje | contar do **registo mais recente** (2026-10-31) |
| 5 | Comparação 2025 vs 2026 enganadora | mostrar “não homóloga” e normalizar por dia; nunca +417 % em destaque |
| 6 | `params` de rota codificado | `decodeURIComponent` no detalhe |
| 7 | Números como string | guarda de forma em `services` (falha alto, não `NaN`) |
| 8 | `lib` a fazer fetch | regra de revisão; `lib` só importa `types` |
| 9 | Gráfico a calcular no JSX | dados entram por prop, já calculados |
| 10 | Stock tratado como histórico | rotular “snapshot”; não calcular consumo |
| 11 | Prometer produto↔ingrediente | nota explícita: falta ficha técnica |
| 12 | Simulador vendido como previsão | aviso “assume volume constante”; mostrar sensibilidade |
| 13 | Tempo perdido em UI antes da fundação | UI base mínima na fase 0, sem explorar |
| 14 | Build quebra por `cacheComponents` | correr `npm run build` a cada merge, não só no fim |
| 15 | 3 pessoas = menos folga | P1 só depois dos P0; polimento não se corta |

---

## 10. Definição de pronto

**App (40 %)** — 5 rotas P0 navegáveis (a 6.ª só se der); todas as
visualizações vêm de JSON real; loading/erro/vazio tratados; responsivo até
360 px; `npm run lint` e `npm run build` limpos; zero erros de consola; números
iguais aos do relatório.

**Análise (30 %)** — `docs/analise/RELATORIO.md` revisto e ligado à app; cada
ecrã com uma conclusão em linguagem de negócio; limitações visíveis.

**Apresentação (20 %)** — 8–10 min: problema → dados → 3 decisões → demo →
limitações → próximos passos.

**Slides (10 %)** — 10–12 slides, mesma paleta da app, gráficos reais (não mockups).

---

## 11. Decisões em aberto

1. **Layout e identidade visual** — direção, densidade, paleta, navegação. *(explicitamente adiado)*
2. **Dividir os 3 workstreams** como na secção 7, ou trocar ecrãs entre pessoas.

Resolvido entretanto: JSON prontos e validados (secção 6); equipa de 3 fixada;
xlsx não vai para o repo — os JSON são a fonte de verdade.
