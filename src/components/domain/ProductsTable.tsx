"use client";

import { useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus } from "@/lib/stock";
import type { Produto } from "@/types";

const TUDO = "tudo";

export function ProductsTable({ produtos }: { produtos: Produto[] }) {
  const [categoria, setCategoria] = useState(TUDO);

  const opcoes = useMemo(
    () => [
      { value: TUDO, label: "Tudo" },
      ...[...new Set(produtos.map((produto) => produto.category))]
        .sort((a, b) => a.localeCompare(b, "pt-PT"))
        .map((value) => ({ value, label: value })),
    ],
    [produtos],
  );

  const linhas = useMemo(
    () =>
      categoria === TUDO
        ? produtos
        : produtos.filter((produto) => produto.category === categoria),
    [produtos, categoria],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedFilter
          label="Filtrar produtos por categoria"
          options={opcoes}
          value={categoria}
          onChange={setCategoria}
        />
        <p className="text-xs text-[var(--muted)]">
          {int(linhas.length)} de {int(produtos.length)} produtos
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <caption className="sr-only">
            Produtos com preço, custo, stock, mínimo e estado.
          </caption>
          <thead>
            <tr>
              <th scope="col">Produto</th>
              <th scope="col">Categoria</th>
              <th scope="col" className="num">
                Preço
              </th>
              <th scope="col" className="num">
                Custo
              </th>
              <th scope="col" className="num">
                Stock
              </th>
              <th scope="col" className="num">
                Mínimo
              </th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[var(--muted)]">
                  Não há produtos nesta categoria.
                </td>
              </tr>
            )}
            {linhas.map((produto) => {
              const estado = stockDisplayStatus(produto);

              return (
                <tr key={produto.id}>
                  <th scope="row" className="font-medium">
                    {produto.name}
                  </th>
                  <td className="text-[var(--muted)]">{produto.category}</td>
                  <td className="num">{eur(produto.unit_price)}</td>
                  <td className="num text-[var(--muted)]">
                    {eur(produto.cost_price)}
                  </td>
                  <td className="num">{int(produto.stock)}</td>
                  <td className="num text-[var(--muted)]">
                    {int(produto.min_stock)}
                  </td>
                  <td>
                    {estado === "esgotado" ? (
                      <span className="badge badge--out">Esgotado</span>
                    ) : estado === "baixo" ? (
                      <span className="badge badge--low">Baixo</span>
                    ) : (
                      <span className="text-[var(--muted)]" title="Stock acima do mínimo">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
