"use client";

/**
 * Filtros ativos da UI: período, categoria, pagamento e pesquisa.
 *
 * Ficam na store (e não no URL nem em cada página) para sobreviverem à
 * navegação entre ecrãs: escolher "Bebidas" em `/vendas` e ir para `/produtos`
 * mantém o contexto.
 */

import { create } from "zustand";
import { EMPTY_FILTERS } from "@/lib/filters";
import type { SalesFilters } from "@/types";

interface FiltersState extends SalesFilters {
  /** Aplica só os campos recebidos; os restantes ficam como estão. */
  apply: (patch: Partial<SalesFilters>) => void;
  reset: () => void;
}

export const useFilters = create<FiltersState>()((set) => ({
  ...EMPTY_FILTERS,
  apply: (patch) => set(patch),
  reset: () => set(EMPTY_FILTERS),
}));
