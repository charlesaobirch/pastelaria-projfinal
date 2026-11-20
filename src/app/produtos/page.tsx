"use client";

import { IngredientsTable } from "@/components/domain/IngredientsTable";
import {
  CategoryMargins,
  GlobalMarginCard,
} from "@/components/domain/InsightCards";
import { ProductSeasonality } from "@/components/domain/ProductSeasonality";
import { ProductsTable } from "@/components/domain/ProductsTable";
import { TrafficProducts } from "@/components/domain/TrafficProducts";
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
          <div className="dashboard-grid">
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

            <aside className="insights-stack" aria-label="Indicadores de vendas">
              <GlobalMarginCard vendas={vendas} produtos={produtos} />
              <TrafficProducts vendas={vendas} produtos={produtos} />
              <CategoryMargins vendas={vendas} produtos={produtos} />
            </aside>
          </div>

          <ProductSeasonality vendas={vendas} produtos={produtos} />

          <section
            className="card ingredients-panel"
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
