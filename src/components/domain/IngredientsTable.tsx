"use client";

import { useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus, stockValue } from "@/lib/stock";
import { useSearch } from "@/store/useSearch";
import type { Ingrediente } from "@/types";
import { Estado } from "./ProductsTable";

const TUDO = "tudo";

export function IngredientsTable({
  ingredientes,
}: {
  ingredientes: Ingrediente[];
}) {
  const [categoria, setCategoria] = useState(TUDO);
  const query = useSearch((state) => state.query);

  const opcoes = useMemo(
    () => [
      { value: TUDO, label: "Tudo" },
      ...[...new Set(ingredientes.map((item) => item.category))]
        .sort((a, b) => a.localeCompare(b, "pt-PT"))
        .map((value) => ({ value, label: value })),
    ],
    [ingredientes],
  );

  const linhas = useMemo(() => {
    const termo = query.trim().toLocaleLowerCase("pt-PT");

    return ingredientes.filter(
      (item) =>
        (categoria === TUDO || item.category === categoria) &&
        (termo === "" || item.name.toLocaleLowerCase("pt-PT").includes(termo)),
    );
  }, [ingredientes, categoria, query]);

  return (
    <div>
      <div className="filters">
        <SegmentedFilter
          label="Filtrar ingredientes por categoria"
          options={opcoes}
          value={categoria}
          onChange={setCategoria}
        />
        <span className="card-meta">
          {int(linhas.length)} de {int(ingredientes.length)}
        </span>
      </div>

      <p className="notice">
        O ficheiro não traz emails nem telefones: «Entrar em contacto» abre um
        rascunho de email com o nome do fornecedor no assunto.
      </p>

      <div className="table-scroll">
        <table className="data-table">
          <caption className="sr-only">
            Ingredientes e embalagens com unidade, stock, mínimo, estado e
            fornecedor.
          </caption>
          <thead>
            <tr>
              <th scope="col">Artigo</th>
              <th scope="col">Unidade</th>
              <th scope="col" className="num">
                Stock
              </th>
              <th scope="col" className="num">
                Mínimo
              </th>
              <th scope="col">Estado</th>
              <th scope="col">Fornecedor</th>
              <th scope="col">
                <span className="sr-only">Contacto</span>
              </th>
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
            {linhas.map((item) => {
              const assunto = encodeURIComponent(`Contacto ${item.supplier}`);

              return (
                <tr key={item.id}>
                  <th scope="row" className="strong">
                    {item.name}
                  </th>
                  <td className="card-meta">{item.unit}</td>
                  <td className="num">
                    {int(item.stock)} {item.unit}
                  </td>
                  <td className="num card-meta">
                    {int(item.min_stock)} {item.unit}
                  </td>
                  <td>
                    <Estado valor={stockDisplayStatus(item)} />
                  </td>
                  <td>{item.supplier}</td>
                  <td className="num">
                    <a
                      className="link-btn"
                      href={`mailto:?subject=${assunto}`}
                      aria-label={`Entrar em contacto com ${item.supplier}`}
                    >
                      Entrar em contacto
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Valor em stock a custo</td>
              <td colSpan={4} className="num strong">
                {eur(stockValue(linhas))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
