"use client";

import { create } from "zustand";

/** Pesquisa global da barra superior: filtra produtos e ingredientes pelo nome. */
interface SearchState {
  query: string;
  setQuery: (query: string) => void;
}

export const useSearch = create<SearchState>()((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));
