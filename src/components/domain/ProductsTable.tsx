"use client";

import { useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus } from "@/lib/stock";
import { useSearch } from "@/store/useSearch";
import type { Produto } from "@/types";

const TUDO = "tudo";

export function ProductsTable({ produtos }: { produtos: Produto[] }) {
  const [categoria, setCategoria] = useState(TUDO);
  const query = useSearch((state) => state.query);

  const opcoes = useMemo(
    () => [
      { value: TUDO, label: "Tudo" },
      ...[...new Set(produtos.map((produto) => produto.category))]
        .sort((a, b) => a.localeCompare(b, "pt-PT"))
        .map((value) => ({ value, label: value })),
    ],
    [produtos],
  );

  const linhas = useMemo(() => {
    const termo = query.trim().toLocaleLowerCase("pt-PT");

    return produtos.filter(
      (produto) =>
        (categoria === TUDO || produto.category === categoria) &&
        (termo === "" || produto.name.toLocaleLowerCase("pt-PT").includes(termo)),
    );
  }, [produtos, categoria, query]);

  return (
    <div>
      <div className="filters">
        <SegmentedFilter
          label="Filtrar produtos por categoria"
          options={opcoes}
          value={categoria}
          onChange={setCategoria}
        />
        <span className="card-meta">
          {int(linhas.length)} de {int(produtos.length)}
        </span>
      </div>

      <div className="table-scroll">
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
                <td colSpan={7} className="empty">
                  Sem resultados para esta pesquisa.
                </td>
              </tr>
            )}
            {linhas.map((produto) => {
              const estado = stockDisplayStatus(produto);

              return (
                <tr key={produto.id}>
                  <th scope="row" className="strong">
                    {produto.name}
                  </th>
                  <td className="card-meta">{produto.category}</td>
                  <td className="num strong">{eur(produto.unit_price)}</td>
                  <td className="num card-meta">{eur(produto.cost_price)}</td>
                  <td className="num">{int(produto.stock)}</td>
                  <td className="num card-meta">{int(produto.min_stock)}</td>
                  <td>
                    <Estado valor={estado} />
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

export function Estado({ valor }: { valor: "ok" | "baixo" | "esgotado" }) {
  if (valor === "esgotado") {
    return (
      <span className="status status--out">
        <i className="dot dot--out" aria-hidden="true" />
        Esgotado
      </span>
    );
  }

  if (valor === "baixo") {
    return (
      <span className="status status--low">
        <i className="dot dot--warn" aria-hidden="true" />
        Baixo
      </span>
    );
  }

  return <span className="status status--ok">—</span>;
}
