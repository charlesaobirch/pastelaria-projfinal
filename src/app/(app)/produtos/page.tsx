"use client";

import { useMemo } from "react";
import {
  CategoryMargins,
  TopFiveShare,
} from "@/components/domain/InsightCards";
import { ProductSeasonality } from "@/components/domain/ProductSeasonality";
import { ProductsTable } from "@/components/domain/ProductsTable";
import { TrafficProducts } from "@/components/domain/TrafficProducts";
import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useData } from "@/hooks/useData";
import { dataRange } from "@/lib/dates";
import { shortDateLabel } from "@/lib/fiscal";
import { int } from "@/lib/format";
import { productStats } from "@/lib/stats";

export default function ProdutosPage() {
  const { vendas, produtos, status, error } = useData();

  const stats = useMemo(
    () => productStats(vendas, produtos),
    [vendas, produtos],
  );
  const limite = useMemo(
    () => dataRange(vendas.map((venda) => venda.date)),
    [vendas],
  );
  const produtosEmFalta = useMemo(
    () => produtos.filter((item) => item.stock < item.min_stock).length,
    [produtos],
  );

  return (
    <main className="page">
      <PageHeader
        title="Produtos"
        description="Catálogo, preço, custo e stock de cada produto"
        range={limite.to ? shortDateLabel(limite.to) : "—"}
      />

      {status === "error" && (
        <p className="notice" role="alert">
          <strong>Não foi possível ler os dados.</strong> {error}
        </p>
      )}

      <section className="panel" aria-labelledby="catalogo-titulo">
        <div className="panel-head">
          <div className="panel-title-block">
            <h2 className="panel-title" id="catalogo-titulo">
              Produtos
            </h2>
            <p className="panel-sub">
              Catálogo, preço, custo e stock dos {int(produtos.length)}{" "}
              produtos, face ao mínimo.
            </p>
          </div>
          <span className="meta-pill meta-pill--tint">
            {int(produtos.length - produtosEmFalta)} acima do mínimo
          </span>
        </div>

        <ProductsTable produtos={produtos} />

        <p className="panel-note">
          {produtosEmFalta === 0
            ? "Nenhum produto abaixo do mínimo"
            : `${int(produtosEmFalta)} produtos abaixo do mínimo`}{" "}
          a {limite.to ? shortDateLabel(limite.to) : "—"} · preço e custo por
          unidade.
        </p>
      </section>

      <div className="grid-row grid-row--three">
        <TopFiveShare stats={stats} />
        <CategoryMargins vendas={vendas} produtos={produtos} />
        <TrafficProducts vendas={vendas} produtos={produtos} />
      </div>

      <ProductSeasonality vendas={vendas} produtos={produtos} />

      <PageFooter />
    </main>
  );
}
