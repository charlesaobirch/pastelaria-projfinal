"use client";

import { useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus, stockValue } from "@/lib/stock";
import { useSearch } from "@/store/useSearch";
import type { Ingrediente } from "@/types";
import { Estado } from "./ProductsTable";

const TUDO = "tudo";

interface GrupoFornecedor {
  supplier: string;
  itens: Ingrediente[];
}

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

  const grupos = useMemo<GrupoFornecedor[]>(() => {
    const mapa = new Map<string, Ingrediente[]>();

    for (const item of linhas) {
      const itens = mapa.get(item.supplier) ?? [];
      itens.push(item);
      mapa.set(item.supplier, itens);
    }

    return [...mapa.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "pt-PT"))
      .map(([supplier, itens]) => ({
        supplier,
        itens: [...itens].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-PT"),
        ),
      }));
  }, [linhas]);

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
          {int(linhas.length)} de {int(ingredientes.length)} artigos ·{" "}
          {int(grupos.length)}{" "}
          {grupos.length === 1 ? "fornecedor" : "fornecedores"}
        </span>
      </div>

      <p className="notice">
        O ficheiro não traz emails nem telefones: «Entrar em contacto» abre um
        rascunho de email com o nome do fornecedor no assunto.
      </p>

      <div className="table-scroll">
        <table className="data-table">
          <caption className="sr-only">
            Ingredientes e embalagens agrupados por fornecedor, com unidade,
            stock, mínimo e estado.
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
              <th scope="col" className="num">
                Contacto
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

            {grupos.map((grupo, indiceGrupo) =>
              grupo.itens.map((item, indiceItem) => {
                const assunto = encodeURIComponent(`Contacto ${grupo.supplier}`);
                const inicioGrupo = indiceItem === 0;

                return (
                  <tr
                    key={item.id}
                    className={
                      inicioGrupo && indiceGrupo > 0 ? "group-start" : undefined
                    }
                  >
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
                    {inicioGrupo && (
                      <>
                        <td className="supplier-cell" rowSpan={grupo.itens.length}>
                          <span className="supplier-name">{grupo.supplier}</span>
                          <span className="card-meta">
                            {int(grupo.itens.length)}{" "}
                            {grupo.itens.length === 1 ? "artigo" : "artigos"}
                          </span>
                        </td>
                        <td
                          className="num supplier-contact"
                          rowSpan={grupo.itens.length}
                        >
                          <a
                            className="link-btn"
                            href={`mailto:?subject=${assunto}`}
                            aria-label={`Entrar em contacto com ${grupo.supplier}`}
                          >
                            Entrar em contacto
                          </a>
                        </td>
                      </>
                    )}
                  </tr>
                );
              }),
            )}
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
