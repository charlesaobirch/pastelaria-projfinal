/**
 * Filtros: escolher um subconjunto das vendas. Tudo o resto (KPIs, gráficos,
 * tabelas) é recalculado sobre esse subconjunto — por isso o filtro vive aqui e
 * não dentro de cada componente, que é como se obtêm números diferentes no
 * cartão e no gráfico.
 */

import type { Ingrediente, Produto, SalesFilters, Venda } from "@/types";

export const EMPTY_FILTERS: SalesFilters = {
  from: null,
  to: null,
  category: null,
  payment: null,
  search: "",
};

/** `"Café"` → `"cafe"`: pesquisa sem acentos nem maiúsculas. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Aplica período, categoria, pagamento e pesquisa a uma lista de vendas.
 *
 * `category` e `search` dependem do produto: a venda só tem `product_id`, por
 * isso o catálogo é indexado num `Map` uma vez, e não com um `find` por linha.
 */
export function filterSales(
  vendas: Venda[],
  produtos: Produto[],
  filters: SalesFilters = EMPTY_FILTERS,
): Venda[] {
  const byId = new Map(produtos.map((produto) => [produto.id, produto]));
  const term = normalize(filters.search);
  const needsProduct = filters.category !== null || term !== "";

  return vendas.filter((venda) => {
    if (filters.from !== null && venda.date < filters.from) return false;
    if (filters.to !== null && venda.date > filters.to) return false;
    if (filters.payment !== null && venda.payment_method !== filters.payment) return false;

    if (!needsProduct) return true;

    const produto = byId.get(venda.product_id);
    if (produto === undefined) return false;
    if (filters.category !== null && produto.category !== filters.category) return false;
    if (term !== "" && !normalize(produto.name).includes(term)) return false;

    return true;
  });
}

/** Mesma ideia para `/stock`, que filtra ingredientes em vez de vendas. */
export function filterIngredients(
  ingredientes: Ingrediente[],
  filters: Pick<SalesFilters, "category" | "search">,
): Ingrediente[] {
  const term = normalize(filters.search);

  return ingredientes.filter((ingrediente) => {
    if (filters.category !== null && ingrediente.category !== filters.category) return false;
    if (term !== "" && !normalize(ingrediente.name).includes(term)) return false;
    return true;
  });
}

/** `true` quando há pelo menos um filtro ativo (para mostrar "limpar"). */
export function hasActiveFilters(filters: SalesFilters): boolean {
  return (
    filters.from !== null ||
    filters.to !== null ||
    filters.category !== null ||
    filters.payment !== null ||
    filters.search.trim() !== ""
  );
}
