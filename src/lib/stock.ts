/**
 * Regras de stock.
 *
 * Atenção: `stock` no JSON é uma **fotografia** no momento da exportação, não
 * um histórico. Aqui não se calcula consumo nem rutura futura — só se compara
 * o stock atual com o mínimo definido.
 */

import type {
  Ingrediente,
  StockAlert,
  StockLevel,
  SupplierValue,
} from "@/types";

export function stockStatus(
  item: Pick<Ingrediente, "stock" | "min_stock">,
): StockLevel {
  if (item.stock <= 0) return "esgotado";
  if (item.stock < item.min_stock) return "baixo";
  return "ok";
}

/** Stock atual em percentagem do mínimo (100 % = exatamente no mínimo). */
export function stockCoverage(
  item: Pick<Ingrediente, "stock" | "min_stock">,
): number {
  return item.min_stock > 0 ? (item.stock / item.min_stock) * 100 : 100;
}

/** Valor do stock a custo: `stock * unit_cost`. */
export function stockValue(ingredientes: Ingrediente[]): number {
  return ingredientes.reduce(
    (sum, item) => sum + item.stock * item.unit_cost,
    0,
  );
}

/**
 * Só os ingredientes abaixo do mínimo, esgotados primeiro e depois por
 * quantidade em falta. É a lista que alimenta os alertas.
 */
export function stockAlerts(ingredientes: Ingrediente[]): StockAlert[] {
  return ingredientes
    .filter((item) => item.stock < item.min_stock)
    .map((item) => ({
      ...item,
      status: stockStatus(item),
      missing: Math.max(item.min_stock - item.stock, 0),
    }))
    .sort((a, b) => {
      const byStatus =
        Number(b.status === "esgotado") - Number(a.status === "esgotado");
      return byStatus !== 0 ? byStatus : b.missing - a.missing;
    });
}

/** Quantos ingredientes há em cada estado (para cartões de resumo). */
export function stockByLevel(
  ingredientes: Ingrediente[],
): Record<StockLevel, number> {
  const counts: Record<StockLevel, number> = { esgotado: 0, baixo: 0, ok: 0 };

  for (const item of ingredientes) {
    counts[stockStatus(item)] += 1;
  }

  return counts;
}

/** Valor em stock por fornecedor, ordenado por valor. */
export function stockValueBySupplier(
  ingredientes: Ingrediente[],
): SupplierValue[] {
  const buckets = new Map<string, { value: number; items: number }>();

  for (const item of ingredientes) {
    const entry = buckets.get(item.supplier) ?? { value: 0, items: 0 };
    entry.value += item.stock * item.unit_cost;
    entry.items += 1;
    buckets.set(item.supplier, entry);
  }

  const total = stockValue(ingredientes);

  return [...buckets.entries()]
    .map(([supplier, entry]) => ({
      supplier,
      value: entry.value,
      items: entry.items,
      share: total > 0 ? (entry.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}
