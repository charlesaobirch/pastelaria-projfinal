"use client";

import { useMemo } from "react";
import { useFilteredSales } from "@/hooks/useFilteredSales";
import { kpis } from "@/lib/stats";
import type { Kpis, LoadStatus } from "@/types";

/** Os 4 KPIs da visão geral, já com os filtros aplicados. */
export function useKpis(): { kpis: Kpis; status: LoadStatus } {
  const { vendas, produtos, status } = useFilteredSales();
  const values = useMemo(() => kpis(vendas, produtos), [vendas, produtos]);

  return { kpis: values, status };
}
