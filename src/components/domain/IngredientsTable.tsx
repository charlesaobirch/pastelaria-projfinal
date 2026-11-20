"use client";

import { useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus, stockValue } from "@/lib/stock";
import type { Ingrediente } from "@/types";

const TUDO = "tudo";

export function IngredientsTable({
  ingredientes,
}: {
  ingredientes: Ingrediente[];
}) {
  const [categoria, setCategoria] = useState(TUDO);

  const opcoes = useMemo(
    () => [
      { value: TUDO, label: "Tudo" },
      ...[...new Set(ingredientes.map((item) => item.category))]
        .sort((a, b) => a.localeCompare(b, "pt-PT"))
        .map((value) => ({ value, label: value })),
    ],
    [ingredientes],
  );

  const linhas = useMemo(
    () =>
      categoria === TUDO
        ? ingredientes
        : ingredientes.filter((item) => item.category === categoria),
    [ingredientes, categoria],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedFilter
          label="Filtrar ingredientes por categoria"
          options={opcoes}
          value={categoria}
          onChange={setCategoria}
        />
        <p className="text-xs text-[var(--muted)]">
          {int(linhas.length)} de {int(ingredientes.length)} artigos
        </p>
      </div>

      <p className="notice">
        O ficheiro não traz emails nem telefones: «Entrar em contacto» abre um
        rascunho de email com o nome do fornecedor no assunto.
      </p>

      <div className="table-wrap">
        <table className="data-table">
          <caption className="sr-only">
            Ingredientes e embalagens com unidade, stock, mínimo, estado e
            fornecedor.
          </caption>
          <thead>
            <tr>
              <th scope="col">Artigo</th>
              <th scope="col">Categoria</th>
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
                <td colSpan={8} className="py-8 text-center text-[var(--muted)]">
                  Não há artigos nesta categoria.
                </td>
              </tr>
            )}
            {linhas.map((item) => {
              const estado = stockDisplayStatus(item);
              const assunto = encodeURIComponent(`Contacto ${item.supplier}`);

              return (
                <tr key={item.id}>
                  <th scope="row" className="font-medium">
                    {item.name}
                  </th>
                  <td className="text-[var(--muted)]">{item.category}</td>
                  <td className="text-[var(--muted)]">{item.unit}</td>
                  <td className="num">
                    {int(item.stock)} {item.unit}
                  </td>
                  <td className="num text-[var(--muted)]">
                    {int(item.min_stock)} {item.unit}
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
                  <td>{item.supplier}</td>
                  <td className="num">
                    <a
                      className="btn"
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
              <td colSpan={4}>Valor em stock a custo</td>
              <td colSpan={4} className="num">
                {eur(stockValue(linhas))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
