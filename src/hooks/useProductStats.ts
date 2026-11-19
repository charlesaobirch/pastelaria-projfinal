"use client";

import { useMemo } from "react";
import { useFilteredSales } from "@/hooks/useFilteredSales";
import { productStats } from "@/lib/stats";
import type { LoadStatus, ProductStat } from "@/types";

/** Ranking de produtos (unidades, receita, lucro, margem, peso no lucro). */
export function useProductStats(): {
  stats: ProductStat[];
  status: LoadStatus;
} {
  const { vendas, produtos, status } = useFilteredSales();
  const stats = useMemo(
    () => productStats(vendas, produtos),
    [vendas, produtos],
  );

  return { stats, status };
}
