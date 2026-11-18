/**
 * Contratos de dados da aplicação.
 *
 * Os três primeiros tipos espelham exatamente `public/data/*.json` — mesmas
 * chaves que os cabeçalhos do Excel, já com os números convertidos para
 * `number` por `scripts/preparar_dados.py`. Não renomear campos: o JSON manda.
 *
 * Os restantes tipos descrevem o que sai de `src/lib/`, para que os ecrãs não
 * inventem formas próprias de representar as mesmas contas.
 */

/* ------------------------------------------------------------------ */
/* Dados de origem                                                     */
/* ------------------------------------------------------------------ */

export interface Produto {
  id: number;
  name: string;
  category: string;
  unit_price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
}

export interface Ingrediente {
  id: number;
  name: string;
  category: string;
  unit: string;
  unit_cost: number;
  stock: number;
  min_stock: number;
  supplier: string;
}

export interface Venda {
  id: number;
  /** Texto `"YYYY-MM-DD"` de propósito: comparar datas é comparar strings. */
  date: string;
  hour: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  payment_method: string;
}

/* ------------------------------------------------------------------ */
/* Filtros e estado de carga                                           */
/* ------------------------------------------------------------------ */

/** `null` = sem restrição. Datas em ISO para comparação lexicográfica. */
export interface SalesFilters {
  from: string | null;
  to: string | null;
  category: string | null;
  payment: string | null;
  search: string;
}

export type LoadStatus = "idle" | "loading" | "ready" | "error";

/* ------------------------------------------------------------------ */
/* Resultados de lib/stats.ts                                          */
/* ------------------------------------------------------------------ */

export interface Kpis {
  revenue: number;
  cost: number;
  profit: number;
  /** Percentagem (0–100), não fração. */
  margin: number;
  units: number;
  lines: number;
  /** Receita média por linha de venda. */
  avgTicket: number;
}

export interface MonthlyPoint {
  /** Chave de agrupamento, ex. `"2026-07"`. */
  month: string;
  /** Etiqueta para eixos, ex. `"Jul/26"`. */
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  units: number;
  lines: number;
  /** Dias distintos com vendas (não dias de calendário). */
  days: number;
}

export interface WeekdayPoint {
  /** 0 = segunda … 6 = domingo. */
  weekday: number;
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  units: number;
  days: number;
  revenuePerDay: number;
  profitPerDay: number;
}

export interface HourPoint {
  hour: number;
  revenue: number;
  cost: number;
  profit: number;
  units: number;
  lines: number;
}

export interface ProductStat {
  id: number;
  name: string;
  category: string;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  /** Preço médio praticado (receita / unidades). */
  avgPrice: number;
  /** Percentagem do lucro total. */
  profitShare: number;
}

export interface CategoryStat {
  category: string;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  profitShare: number;
}

export interface PaymentStat {
  method: string;
  lines: number;
  revenue: number;
  /** Percentagem da receita total. */
  share: number;
  avgTicket: number;
}

export interface ParetoPoint {
  id: number;
  name: string;
  profit: number;
  /** Lucro acumulado até este produto (ordem decrescente). */
  cumulative: number;
  /** Acumulado em percentagem do lucro total. */
  cumulativePct: number;
}

/* ------------------------------------------------------------------ */
/* Resultados de lib/stock.ts                                          */
/* ------------------------------------------------------------------ */

export type StockLevel = "esgotado" | "baixo" | "ok";

export interface StockAlert extends Ingrediente {
  status: StockLevel;
  /** Quanto falta para chegar ao mínimo (0 se esgotado sem mínimo). */
  missing: number;
}

export interface SupplierValue {
  supplier: string;
  /** Valor do stock a custo: `stock * unit_cost`. */
  value: number;
  items: number;
  /** Percentagem do valor total em stock. */
  share: number;
}
