"use client";

import { type FormEvent, useMemo, useState } from "react";
import { SearchField } from "@/components/ui/SearchField";
import { eur, int } from "@/lib/format";
import { stockDisplayStatus } from "@/lib/stock";
import { useDataStore } from "@/store/useDataStore";
import type { Produto, StockLevel } from "@/types";

const TUDO = "tudo";

export function ProductsTable({ produtos }: { produtos: Produto[] }) {
  const [categoria, setCategoria] = useState(TUDO);
  const [query, setQuery] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [erro, setErro] = useState("");
  const adicionarProduto = useDataStore((state) => state.addProduto);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados = new FormData(event.currentTarget);
    const nome = String(dados.get("name") ?? "").trim();
    const categoriaNome = String(dados.get("category") ?? "").trim();
    const valores = [
      Number(dados.get("unit_price")),
      Number(dados.get("cost_price")),
      Number(dados.get("stock")),
      Number(dados.get("min_stock")),
    ];

    if (
      !nome ||
      !categoriaNome ||
      valores.some((valor) => !Number.isFinite(valor) || valor < 0)
    ) {
      setErro("Preencha todos os campos com valores válidos.");
      return;
    }

    adicionarProduto({
      name: nome,
      category: categoriaNome,
      unit_price: valores[0],
      cost_price: valores[1],
      stock: valores[2],
      min_stock: valores[3],
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
        (termo === "" ||
          produto.name.toLocaleLowerCase("pt-PT").includes(termo)),
    );
  }, [produtos, categoria, query]);

  return (
    <div>
      <div className="filter-bar">
        <fieldset className="filter-group">
          <legend className="sr-only">Filtrar produtos por categoria</legend>
          {opcoes.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              className="pill"
              aria-pressed={categoria === opcao.value}
              onClick={() => setCategoria(opcao.value)}
            >
              {opcao.label}
            </button>
          ))}
        </fieldset>
        <SearchField
          label="Pesquisar produtos"
          placeholder="Pesquisar produtos…"
          value={query}
          onChange={setQuery}
        />
        <div className="filter-group">
          <span className="filter-count">
            {int(linhas.length)} de {int(produtos.length)}
          </span>
          <button
            type="button"
            className="btn-edit"
            onClick={() => setFormularioAberto((aberto) => !aberto)}
            aria-expanded={formularioAberto}
            aria-controls="formulario-produto"
          >
            Editar
          </button>
        </div>
      </div>

      {formularioAberto && (
        <form
          id="formulario-produto"
          className="edit-form"
          onSubmit={handleSubmit}
        >
          <datalist id="categorias-produto">
            {opcoes
              .filter((opcao) => opcao.value !== TUDO)
              .map((opcao) => (
                <option key={opcao.value} value={opcao.value} />
              ))}
          </datalist>
          <div className="form-head">
            <h3 className="form-title">Adicionar produto</h3>
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
              <span>Nome do produto</span>
              <input
                name="name"
                required
                placeholder="Ex.: Bolo de aniversário"
              />
            </label>
            <label className="form-field">
              <span>Categoria</span>
              <input
                name="category"
                required
                list="categorias-produto"
                placeholder="Ex.: Bolos"
              />
            </label>
            <label className="form-field">
              <span>Preço (€)</span>
              <input
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </label>
            <label className="form-field">
              <span>Custo (€)</span>
              <input
                name="cost_price"
                type="number"
                min="0"
                step="0.01"
                required
              />
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
              Guardar produto
            </button>
          </div>
        </form>
      )}

      <div className="dtable-wrap">
        <table className="dtable">
          <caption className="sr-only">
            Produtos com categoria, preço, custo, stock, mínimo e estado.
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
                <td colSpan={7} className="notice">
                  Sem resultados para esta pesquisa.
                </td>
              </tr>
            )}
            {linhas.map((produto) => {
              const estado = produto.estado ?? stockDisplayStatus(produto);

              return (
                <tr key={produto.id}>
                  <th scope="row" className="cell-name">
                    {produto.name}
                  </th>
                  <td className="cell-soft">{produto.category}</td>
                  <td className="num cell-bold">{eur(produto.unit_price)}</td>
                  <td className="num cell-soft">{eur(produto.cost_price)}</td>
                  <td className="num cell-indigo">{int(produto.stock)}</td>
                  <td className="num cell-soft">{int(produto.min_stock)}</td>
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
    return <span className="status-pill status-pill--out">Esgotado</span>;
  }

  if (valor === "baixo") {
    return <span className="status-pill">Baixo</span>;
  }

  return <span className="cell-soft">—</span>;
}
