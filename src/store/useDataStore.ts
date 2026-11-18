"use client";

/**
 * Dados carregados uma vez e partilhados por toda a app.
 *
 * Store global (e não Context) de propósito: o conteúdo é estático e igual para
 * todos — não há dados por utilizador nem por pedido, logo não há nada que possa
 * vazar entre pedidos. A store nunca guarda o `Promise`, só o resultado.
 */

import { create } from "zustand";
import { fetchAll } from "@/services/data";
import type { Ingrediente, LoadStatus, Produto, Venda } from "@/types";

interface DataState {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  vendas: Venda[];
  status: LoadStatus;
  error: string | null;
  /** Lê os três JSON; repetir a chamada não repete o fetch. */
  load: () => Promise<void>;
}

export const useDataStore = create<DataState>()((set, get) => ({
  produtos: [],
  ingredientes: [],
  vendas: [],
  status: "idle",
  error: null,

  load: async () => {
    const { status } = get();

    // "error" fica de fora para permitir tentar de novo.
    if (status === "loading" || status === "ready") return;

    set({ status: "loading", error: null });

    try {
      const { produtos, ingredientes, vendas } = await fetchAll();
      set({ produtos, ingredientes, vendas, status: "ready" });
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error ? error.message : "Erro desconhecido ao carregar os dados.",
      });
    }
  },
}));
