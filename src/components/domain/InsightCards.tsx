"use client";

import { eur, int, pct } from "@/lib/format";
import { categoryStats, kpis } from "@/lib/stats";
import type { ProductStat, Produto, Venda } from "@/types";

export function GlobalMarginCard({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const resumo = kpis(vendas, produtos);

  return (
    <section className="panel" aria-label="Margem global">
      <div className="stat-block">
        <span className="stat-label">Margem global</span>
        <span className="stat-value">{pct(resumo.margin)}</span>
        <span className="stat-sub">
          {eur(resumo.revenue)} de receita · {int(resumo.lines)} vendas
        </span>
      </div>
    </section>
  );
}

/** Quota dos cinco produtos com mais lucro, com a barra segmentada do modelo. */
export function TopFiveShare({ stats }: { stats: ProductStat[] }) {
  const top = stats.slice(0, 5);
  const total = stats.reduce((soma, item) => soma + item.profit, 0);
  const share =
    total > 0
      ? (top.reduce((soma, item) => soma + item.profit, 0) / total) * 100
      : 0;

  return (
    <section
      className="panel panel--hero"
      aria-labelledby="top-partilha-titulo"
    >
      <h3 className="sr-only" id="top-partilha-titulo">
        Concentração do lucro
      </h3>
      <div className="hero-top">
        <span className="hero-chip">Top 5</span>
        <span className="hero-note">do lucro bruto</span>
      </div>

      <div className="hero-big hero-big--green">{pct(share)}</div>
      <p className="hero-copy">{top.map((item) => item.name).join(", ")}.</p>

      <div
        className="hero-bar"
        role="img"
        aria-label={`Os cinco produtos principais geram ${pct(share)} do lucro`}
      >
        {top.map((item, index) => (
          <span
            key={item.id}
            style={{
              width: `${total > 0 ? (item.profit / total) * 100 : 0}%`,
              background: [
                "#122435",
                "#224766",
                "#4e7295",
                "#c3ced8",
                "#b3b3b3",
              ][index],
            }}
          />
        ))}
        <span style={{ flex: 1, background: "#efefef" }} />
      </div>

      <div className="hero-legend">
        {top.slice(0, 3).map((item) => (
          <span key={item.id}>
            <strong>{item.name}</strong> {pct(item.profitShare)}
          </span>
        ))}
      </div>

      <p className="panel-note">
        {int(top.length)} dos {int(stats.length)} produtos fazem quase metade do
        lucro.
      </p>
    </section>
  );
}

export function CategoryMargins({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const linhas = [...categoryStats(vendas, produtos)].sort(
    (a, b) => b.margin - a.margin,
  );
  const menor = linhas.length > 0 ? linhas[linhas.length - 1].category : null;
  const maior = linhas.length > 0 ? linhas[0].category : null;
  const cores: Record<string, string> = {
    Bebidas: "var(--prussian)",
    Pastéis: "var(--heat-3)",
    Pão: "var(--grid)",
    Bolos: "var(--sinopia)",
  };

  return (
    <section className="panel" aria-labelledby="margem-categoria-titulo">
      <div className="panel-head">
        <div className="panel-title-block">
          <h3 className="panel-title" id="margem-categoria-titulo">
            Margem por categoria
          </h3>
          <p className="panel-sub">Lucro ÷ receita · ano fiscal</p>
        </div>
      </div>

      {linhas.length === 0 && (
        <p className="panel-note">Sem vendas no período.</p>
      )}

      {linhas.length > 0 && (
        <div className="category-rows">
          {linhas.map((linha) => (
            <div className="bar-line" key={linha.category}>
              <span className="bar-line-label">{linha.category}</span>
              <div
                className="bar-line-track"
                role="img"
                aria-label={`${linha.category}: margem de ${pct(linha.margin)}`}
              >
                <div
                  className="bar-line-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, linha.margin))}%`,
                    background:
                      cores[linha.category] ??
                      (linha.category === menor
                        ? "var(--sinopia)"
                        : "var(--indigo)"),
                  }}
                />
              </div>
              <span className="bar-line-value">{pct(linha.margin)}</span>
            </div>
          ))}
        </div>
      )}

      {linhas.length > 0 && (
        <>
          <p className="panel-note product-card-note">
            A margem mais baixa é de {menor}; a mais alta, de {maior}.
          </p>
          <p className="panel-note product-card-note">
            Margem = (preço − custo) ÷ receita.
          </p>
        </>
      )}
    </section>
  );
}
