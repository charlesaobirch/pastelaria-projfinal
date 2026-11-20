"use client";

import { IngredientsTable } from "@/components/domain/IngredientsTable";
import {
  CategoryMargins,
  GlobalMarginCard,
} from "@/components/domain/InsightCards";
import { ProductsTable } from "@/components/domain/ProductsTable";
import { TopProducts } from "@/components/domain/TopProducts";
import { useData } from "@/hooks/useData";

export default function ProdutosPage() {
  const { produtos, ingredientes, vendas, status, error } = useData();

  return (
    <main className="page">
      <div className="page-head">
        <h1 className="page-title">Produtos</h1>
        <p className="page-sub">
          Catálogo, níveis de stock e desempenho comercial da pastelaria.
        </p>
      </div>

      {status === "error" && (
        <div role="alert" className="notice">
          <strong>Não foi possível ler os dados.</strong> {error}
        </div>
      )}

      {status !== "ready" && status !== "error" && (
        <output className="card">A carregar dados…</output>
      )}

      {status === "ready" && (
        <>
          <div className="grid-main">
            <section className="card" id="produtos" aria-labelledby="produtos-titulo">
              <div className="card-head">
                <div>
                  <h2 className="card-title" id="produtos-titulo">
                    Produtos
                  </h2>
                  <p className="card-sub">
                    Preço, custo e stock frente ao mínimo.
                  </p>
                </div>
              </div>
              <ProductsTable produtos={produtos} />
            </section>

            <div className="stack">
              <GlobalMarginCard vendas={vendas} produtos={produtos} />
              <CategoryMargins vendas={vendas} produtos={produtos} />
            </div>
          </div>

          <div className="grid-lower" id="vendas">
            <TopProducts vendas={vendas} produtos={produtos} />
          </div>

          <section
            className="card mt-4"
            id="ingredientes"
            aria-labelledby="ingredientes-titulo"
          >
            <div className="card-head">
              <div>
                <h2 className="card-title" id="ingredientes-titulo">
                  Ingredientes e embalagens
                </h2>
                <p className="card-sub">
                  Unidades, stock mínimo e fornecedor de cada artigo.
                </p>
              </div>
            </div>
            <IngredientsTable ingredientes={ingredientes} />
          </section>
        </>
      )}
    </main>
  );
}
