"use client";

/**
 * Acede aos dados (e dispara a carga na primeira utilização).
 * Todos os ecrãs entram por aqui — nenhum faz `fetch` diretamente.
 */

import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useDataStore } from "@/store/useDataStore";
import type { Ingrediente, LoadStatus, Produto, Venda } from "@/types";

export interface UseDataResult {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  vendas: Venda[];
  status: LoadStatus;
  error: string | null;
}

export function useData(): UseDataResult {
  const { produtos, ingredientes, vendas, status, error, load } = useDataStore(
    useShallow((state) => ({
      produtos: state.produtos,
      ingredientes: state.ingredientes,
      vendas: state.vendas,
      status: state.status,
      error: state.error,
      load: state.load,
    })),
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { produtos, ingredientes, vendas, status, error };
}
