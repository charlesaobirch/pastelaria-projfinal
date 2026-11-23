"use client";

import { useMemo } from "react";
import { IngredientsTable } from "@/components/domain/IngredientsTable";
import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useData } from "@/hooks/useData";
import { dataRange } from "@/lib/dates";
import { shortDateLabel } from "@/lib/fiscal";
import { eur, int, pct } from "@/lib/format";
import { productStats } from "@/lib/stats";
import { stockAlerts, stockValue, stockValueBySupplier } from "@/lib/stock";

export default function StockPage() {
  const { vendas, produtos, ingredientes, status, error } = useData();

  const alertas = useMemo(() => stockAlerts(ingredientes), [ingredientes]);
  const produtosEmFalta = useMemo(
    () => produtos.filter((item) => item.stock < item.min_stock).length,
    [produtos],
  );
  const valor = useMemo(() => stockValue(ingredientes), [ingredientes]);
  const fornecedores = useMemo(
    () => stockValueBySupplier(ingredientes),
    [ingredientes],
  );
  const limite = useMemo(
    () => dataRange(vendas.map((venda) => venda.date)),
    [vendas],
  );

  const cobertura = useMemo(() => {
    const dias = new Set(vendas.map((venda) => venda.date)).size;
    const vendasPorProduto = new Map(
      productStats(vendas, produtos).map((produto) => [
        produto.id,
        produto.units,
      ]),
    );

    return produtos
      .map((produto) => {
        const unidades = vendasPorProduto.get(produto.id) ?? 0;
        const porDia = dias > 0 ? unidades / dias : 0;
        return {
          ...produto,
          dias: porDia > 0 ? produto.stock / porDia : Number.POSITIVE_INFINITY,
        };
      })
      .filter((produto) => Number.isFinite(produto.dias))
      .sort((a, b) => a.dias - b.dias);
  }, [vendas, produtos]);

  const maisCurtos = cobertura.slice(0, 5);
  const maisLongos = cobertura.slice(-5).reverse();
  const maxCobertura =
    cobertura.length > 0 ? cobertura[cobertura.length - 1].dias : 1;

  return (
    <main className="page">
      <PageHeader
        title="Stock"
        description="Rupturas, cobertura e concentração de fornecedores"
        range={limite.to ? shortDateLabel(limite.to) : "—"}
      />

      {status === "error" && (
        <p className="notice" role="alert">
          <strong>Não foi possível ler os dados.</strong> {error}
        </p>
      )}

      <div className="grid-row grid-row--four">
        <section className="panel">
          <span className="stat-label">Ingredientes em falta</span>
          <span className="stat-value stat-value--alert">
            {int(alertas.length)}
          </span>
          <span className="stat-sub">
            de {int(ingredientes.length)} artigos
          </span>
        </section>
        <section className="panel">
          <span className="stat-label">Produtos em falta</span>
          <span className="stat-value">{int(produtosEmFalta)}</span>
          <span className="stat-sub">
            {int(produtos.length - produtosEmFalta)} acima do mínimo
          </span>
        </section>
        <section className="panel">
          <span className="stat-label">Valor de stock</span>
          <span className="stat-value">{eur(valor)}</span>
          <span className="stat-sub">ingredientes</span>
        </section>
        <section className="panel">
          <span className="stat-label">Concentração</span>
          <span className="stat-value">{pct(fornecedores[0]?.share ?? 0)}</span>
          <span className="stat-sub">{fornecedores[0]?.supplier ?? "—"}</span>
        </section>
      </div>

      <section className="panel" aria-labelledby="ingredientes-titulo">
        <div className="panel-head">
          <div className="panel-title-block">
            <h2 className="panel-title" id="ingredientes-titulo">
              Ingredientes e embalagens
            </h2>
            <p className="panel-sub">
              Unidades, stock mínimo e fornecedor de cada artigo.
            </p>
          </div>
          <span className="meta-pill meta-pill--alert">
            <span className="meta-dot" /> {int(alertas.length)} abaixo do mínimo
          </span>
        </div>

        <IngredientsTable ingredientes={ingredientes} />
      </section>

      <section className="panel" aria-labelledby="cobertura-titulo">
        <div className="panel-head">
          <div className="panel-title-block">
            <h2 className="panel-title" id="cobertura-titulo">
              Dias de cobertura por produto
            </h2>
            <p className="panel-sub">
              Stock atual ÷ venda média diária · {int(produtos.length)} produtos
            </p>
          </div>
          <span className="meta-pill meta-pill--tint">
            {cobertura.length > 0
              ? `${Math.round(cobertura[0].dias)} a ${Math.round(maxCobertura)} dias`
              : "—"}
          </span>
        </div>

        <div className="coverage-cols">
          <div>
            {maisCurtos.map((produto) => {
              const cor =
                produto.dias < 30 ? "var(--sinopia)" : "var(--indigo)";

              return (
                <div className="coverage-row" key={produto.id}>
                  <span className="coverage-name">{produto.name}</span>
                  <span className="coverage-days" style={{ color: cor }}>
                    {Math.round(produto.dias)} d
                  </span>
                  <span className="coverage-bar" style={{ color: cor }}>
                    <span
                      style={{
                        width: `${Math.min(100, (produto.dias / maxCobertura) * 100)}%`,
                      }}
                    />
                  </span>
                  <span className="panel-note">{int(produto.stock)} un</span>
                </div>
              );
            })}
          </div>
          <div>
            {maisLongos.map((produto) => (
              <div className="coverage-row" key={produto.id}>
                <span className="coverage-name">{produto.name}</span>
                <span className="coverage-days">
                  {Math.round(produto.dias)} d
                </span>
                <span className="coverage-bar">
                  <span
                    style={{
                      width: `${Math.min(100, (produto.dias / maxCobertura) * 100)}%`,
                    }}
                  />
                </span>
                <span className="panel-note">{int(produto.stock)} un</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-foot">
          <span className="panel-note">&lt; 30 dias</span>
          <span className="panel-note">&gt; 90 dias</span>
        </div>
        <p className="panel-note">
          Mesmo os produtos frescos têm cobertura longa: o stock é uma
          fotografia e não reconcilia com as vendas.
        </p>
      </section>

      <PageFooter />
    </main>
  );
}
