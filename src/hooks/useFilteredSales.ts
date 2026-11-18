"use client";

/**
 * Vendas depois de aplicados os filtros da UI.
 *
 * Devolve também o catálogo, porque as contas seguintes (lucro, categoria)
 * precisam dele para o join — e o total sem filtros, para mostrar "x de y".
 */

import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useData } from "@/hooks/useData";
import { filterSales } from "@/lib/filters";
import { useFilters } from "@/store/useFilters";
import type { LoadStatus, Produto, SalesFilters, Venda } from "@/types";

export interface UseFilteredSalesResult {
  /** Vendas que passaram os filtros. */
  vendas: Venda[];
  produtos: Produto[];
  filtros: SalesFilters;
  status: LoadStatus;
  /** Linhas existentes antes de filtrar. */
  total: number;
}

export function useFilteredSales(): UseFilteredSalesResult {
  const { vendas, produtos, status } = useData();
  const [from, to, category, payment, search] = useFilters(
    useShallow((state) => [state.from, state.to, state.category, state.payment, state.search]),
  );

  const filtradas = useMemo(
    () => filterSales(vendas, produtos, { from, to, category, payment, search }),
    [vendas, produtos, from, to, category, payment, search],
  );

  return {
    vendas: filtradas,
    produtos,
    filtros: { from, to, category, payment, search },
    status,
    total: vendas.length,
  };
}
