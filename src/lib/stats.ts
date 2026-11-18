/**
 * Contas da aplicação. Funções puras: entram arrays, saem números — sem fetch,
 * sem store, sem React. Chamar duas vezes com os mesmos dados dá o mesmo
 * resultado, e é por isso que os três ecrãs podem confiar nos mesmos valores.
 *
 * Decisões que ficam aqui (e não replicadas em cada ecrã):
 * - lucro = (unit_price − cost_price do produto) × quantity
 * - margem em percentagem (0–100)
 * - médias por dia usam **dias distintos com vendas**, não dias de calendário
 * - `days` de uma série mensal conta dias com vendas, não dias do mês
 */

import {
  monthKey,
  monthLabel,
  parseDate,
  weekdayIndex,
  weekdayLabel,
} from "@/lib/dates";
import type {
  CategoryStat,
  HourPoint,
  Kpis,
  MonthlyPoint,
  ParetoPoint,
  PaymentStat,
  ProductStat,
  Produto,
  Venda,
  WeekdayPoint,
} from "@/types";

function indexProducts(produtos: Produto[]): Map<number, Produto> {
  return new Map(produtos.map((produto) => [produto.id, produto]));
}

function costOf(byId: Map<number, Produto>, productId: number): number {
  return byId.get(productId)?.cost_price ?? 0;
}

function percent(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

interface Bucket {
  revenue: number;
  cost: number;
  units: number;
  lines: number;
  days: Set<string>;
}

function createBucket(): Bucket {
  return { revenue: 0, cost: 0, units: 0, lines: 0, days: new Set() };
}

function accumulate(bucket: Bucket, venda: Venda, costPrice: number): void {
  bucket.revenue += venda.unit_price * venda.quantity;
  bucket.cost += costPrice * venda.quantity;
  bucket.units += venda.quantity;
  bucket.lines += 1;
  bucket.days.add(venda.date);
}

function emptyKpis(): Kpis {
  return {
    revenue: 0,
    cost: 0,
    profit: 0,
    margin: 0,
    units: 0,
    lines: 0,
    avgTicket: 0,
  };
}

/** Receita, custo, lucro, margem, unidades e ticket médio do conjunto dado. */
export function kpis(vendas: Venda[], produtos: Produto[]): Kpis {
  if (vendas.length === 0) return emptyKpis();

  const byId = indexProducts(produtos);
  let revenue = 0;
  let cost = 0;
  let units = 0;

  for (const venda of vendas) {
    revenue += venda.unit_price * venda.quantity;
    cost += costOf(byId, venda.product_id) * venda.quantity;
    units += venda.quantity;
  }

  const profit = revenue - cost;

  return {
    revenue,
    cost,
    profit,
    margin: percent(profit, revenue),
    units,
    lines: vendas.length,
    avgTicket: revenue / vendas.length,
  };
}

/** Série mensal, ordenada por mês (Nov/25 → Out/26). */
export function revenueByMonth(
  vendas: Venda[],
  produtos: Produto[],
): MonthlyPoint[] {
  const byId = indexProducts(produtos);
  const buckets = new Map<string, Bucket>();

  for (const venda of vendas) {
    const key = monthKey(parseDate(venda.date));
    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = createBucket();
      buckets.set(key, bucket);
    }

    accumulate(bucket, venda, costOf(byId, venda.product_id));
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, bucket]) => ({
      month,
      label: monthLabel(month),
      revenue: bucket.revenue,
      cost: bucket.cost,
      profit: bucket.revenue - bucket.cost,
      units: bucket.units,
      lines: bucket.lines,
      days: bucket.days.size,
    }));
}

/** Sempre 7 pontos (segunda a domingo), mesmo que filtrado a um só dia. */
export function revenueByWeekday(
  vendas: Venda[],
  produtos: Produto[],
): WeekdayPoint[] {
  const byId = indexProducts(produtos);
  const buckets = Array.from({ length: 7 }, createBucket);

  for (const venda of vendas) {
    const index = weekdayIndex(parseDate(venda.date));
    accumulate(buckets[index], venda, costOf(byId, venda.product_id));
  }

  return buckets.map((bucket, weekday) => {
    const profit = bucket.revenue - bucket.cost;
    const days = bucket.days.size;

    return {
      weekday,
      label: weekdayLabel(weekday),
      revenue: bucket.revenue,
      cost: bucket.cost,
      profit,
      units: bucket.units,
      days,
      revenuePerDay: days > 0 ? bucket.revenue / days : 0,
      profitPerDay: days > 0 ? profit / days : 0,
    };
  });
}

/** Sempre as 13 horas de funcionamento (7h–19h), mesmo com horas sem vendas. */
export function revenueByHour(
  vendas: Venda[],
  produtos: Produto[],
): HourPoint[] {
  const byId = indexProducts(produtos);
  const buckets = new Map<number, Bucket>();

  for (const venda of vendas) {
    let bucket = buckets.get(venda.hour);

    if (!bucket) {
      bucket = createBucket();
      buckets.set(venda.hour, bucket);
    }

    accumulate(bucket, venda, costOf(byId, venda.product_id));
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, bucket]) => ({
      hour,
      revenue: bucket.revenue,
      cost: bucket.cost,
      profit: bucket.revenue - bucket.cost,
      units: bucket.units,
      lines: bucket.lines,
    }));
}

/** Uma linha por produto vendido, ordenada por lucro. */
export function productStats(
  vendas: Venda[],
  produtos: Produto[],
): ProductStat[] {
  const byId = indexProducts(produtos);
  const buckets = new Map<
    number,
    { name: string; category: string; bucket: Bucket }
  >();

  for (const venda of vendas) {
    let entry = buckets.get(venda.product_id);

    if (!entry) {
      const produto = byId.get(venda.product_id);
      entry = {
        name: produto?.name ?? "Desconhecido",
        category: produto?.category ?? "Sem categoria",
        bucket: createBucket(),
      };
      buckets.set(venda.product_id, entry);
    }

    accumulate(entry.bucket, venda, costOf(byId, venda.product_id));
  }

  const rows: ProductStat[] = [...buckets.entries()].map(([id, entry]) => {
    const profit = entry.bucket.revenue - entry.bucket.cost;

    return {
      id,
      name: entry.name,
      category: entry.category,
      units: entry.bucket.units,
      revenue: entry.bucket.revenue,
      cost: entry.bucket.cost,
      profit,
      margin: percent(profit, entry.bucket.revenue),
      avgPrice:
        entry.bucket.units > 0 ? entry.bucket.revenue / entry.bucket.units : 0,
      profitShare: 0,
    };
  });

  const totalProfit = rows.reduce((sum, row) => sum + row.profit, 0);

  for (const row of rows) {
    row.profitShare = percent(row.profit, totalProfit);
  }

  return rows.sort((a, b) => b.profit - a.profit);
}

/** Agregação por categoria de produto, ordenada por lucro. */
export function categoryStats(
  vendas: Venda[],
  produtos: Produto[],
): CategoryStat[] {
  const byId = indexProducts(produtos);
  const buckets = new Map<string, Bucket>();

  for (const venda of vendas) {
    const produto = byId.get(venda.product_id);
    const category = produto?.category ?? "Sem categoria";
    let bucket = buckets.get(category);

    if (!bucket) {
      bucket = createBucket();
      buckets.set(category, bucket);
    }

    accumulate(bucket, venda, costOf(byId, venda.product_id));
  }

  const rows: CategoryStat[] = [...buckets.entries()].map(
    ([category, bucket]) => {
      const profit = bucket.revenue - bucket.cost;

      return {
        category,
        units: bucket.units,
        revenue: bucket.revenue,
        cost: bucket.cost,
        profit,
        margin: percent(profit, bucket.revenue),
        profitShare: 0,
      };
    },
  );

  const totalProfit = rows.reduce((sum, row) => sum + row.profit, 0);

  for (const row of rows) {
    row.profitShare = percent(row.profit, totalProfit);
  }

  return rows.sort((a, b) => b.profit - a.profit);
}

/** Repartição por método de pagamento, ordenada por receita. */
export function paymentStats(vendas: Venda[]): PaymentStat[] {
  const buckets = new Map<string, { lines: number; revenue: number }>();

  for (const venda of vendas) {
    const entry = buckets.get(venda.payment_method) ?? { lines: 0, revenue: 0 };
    entry.lines += 1;
    entry.revenue += venda.unit_price * venda.quantity;
    buckets.set(venda.payment_method, entry);
  }

  const total = vendas.reduce(
    (sum, venda) => sum + venda.unit_price * venda.quantity,
    0,
  );

  return [...buckets.entries()]
    .map(([method, entry]) => ({
      method,
      lines: entry.lines,
      revenue: entry.revenue,
      share: percent(entry.revenue, total),
      avgTicket: entry.lines > 0 ? entry.revenue / entry.lines : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Curva de Pareto do lucro: acumulado por produto, do maior para o menor. */
export function pareto(stats: ProductStat[]): ParetoPoint[] {
  const sorted = [...stats].sort((a, b) => b.profit - a.profit);
  const total = sorted.reduce((sum, row) => sum + row.profit, 0);
  let cumulative = 0;

  return sorted.map((row) => {
    cumulative += row.profit;

    return {
      id: row.id,
      name: row.name,
      profit: row.profit,
      cumulative,
      cumulativePct: percent(cumulative, total),
    };
  });
}
