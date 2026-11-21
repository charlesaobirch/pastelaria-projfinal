"use client";

import { type FormEvent, useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus, stockValue } from "@/lib/stock";
import { useDataStore } from "@/store/useDataStore";
import { useSearch } from "@/store/useSearch";
import type { Ingrediente, StockLevel } from "@/types";
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
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [erro, setErro] = useState("");
  const query = useSearch((state) => state.query);
  const adicionarIngrediente = useDataStore((state) => state.addIngrediente);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados = new FormData(event.currentTarget);
    const nome = String(dados.get("name") ?? "").trim();
    const unidade = String(dados.get("unit") ?? "").trim();
    const fornecedor = String(dados.get("supplier") ?? "").trim();
    const valores = [
      Number(dados.get("stock")),
      Number(dados.get("min_stock")),
    ];

    if (
      !nome ||
      !unidade ||
      !fornecedor ||
      valores.some((valor) => !Number.isFinite(valor) || valor < 0)
    ) {
      setErro("Preencha todos os campos com valores válidos.");
      return;
    }

    adicionarIngrediente({
      name: nome,
      // O formulário não pede categoria nem custo: mantemos os defaults do catálogo.
      category: "Ingredientes",
      unit: unidade,
      unit_cost: 0,
      stock: valores[0],
      min_stock: valores[1],
      supplier: fornecedor,
      estado: String(dados.get("estado")) as StockLevel,
    });

    event.currentTarget.reset();
    setErro("");
    setFormularioAberto(false);
    setCategoria(TUDO);
  }

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

  const fornecedores = useMemo(
    () => [...new Set(ingredientes.map((item) => item.supplier))].sort(),
    [ingredientes],
  );

  return (
    <div>
      <div className="filters">
        <SegmentedFilter
          label="Filtrar ingredientes por categoria"
          options={opcoes}
          value={categoria}
          onChange={setCategoria}
        />
        <div className="filters-actions">
          <button
            type="button"
            className="btn-edit"
            onClick={() => setFormularioAberto((aberto) => !aberto)}
            aria-expanded={formularioAberto}
            aria-controls="formulario-ingrediente"
          >
            Editar
          </button>
          <span className="card-meta">
            {int(linhas.length)} de {int(ingredientes.length)} artigos ·{" "}
            {int(grupos.length)}{" "}
            {grupos.length === 1 ? "fornecedor" : "fornecedores"}
          </span>
        </div>
      </div>

      {formularioAberto && (
        <form
          id="formulario-ingrediente"
          className="edit-form"
          onSubmit={handleSubmit}
        >
          <datalist id="fornecedores-ingrediente">
            {fornecedores.map((fornecedor) => (
              <option key={fornecedor} value={fornecedor} />
            ))}
          </datalist>
          <div className="form-head">
            <h3 className="form-title">Adicionar artigo</h3>
            <button
              type="button"
              className="form-close"
              onClick={() => setFormularioAberto(false)}
            >
              Fechar
            </button>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Nome do artigo</span>
              <input
                name="name"
                required
                placeholder="Ex.: Farinha T55"
              />
            </label>
            <label className="form-field">
              <span>Unidade</span>
              <input name="unit" required placeholder="Ex.: kg" />
            </label>
            <label className="form-field">
              <span>Stock</span>
              <input name="stock" type="number" min="0" step="1" required />
            </label>
            <label className="form-field">
              <span>Mínimo</span>
              <input name="min_stock" type="number" min="0" step="1" required />
            </label>
            <label className="form-field">
              <span>Estado</span>
              <select name="estado" defaultValue="ok">
                <option value="ok">Disponível</option>
                <option value="baixo">Baixo</option>
                <option value="esgotado">Esgotado</option>
              </select>
            </label>
            <label className="form-field">
              <span>Fornecedor</span>
              <input
                name="supplier"
                required
                list="fornecedores-ingrediente"
                placeholder="Ex.: Moagem do Vale"
              />
            </label>
          </div>
          {erro && (
            <p className="form-error" role="alert">
              {erro}
            </p>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="btn-soft"
              onClick={() => setFormularioAberto(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar artigo
            </button>
          </div>
        </form>
      )}

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
                      <Estado valor={item.estado ?? stockDisplayStatus(item)} />
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
