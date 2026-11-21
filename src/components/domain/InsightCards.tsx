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
    <section className="panel" aria-labelledby="top-partilha-titulo">
      <div className="panel-head">
        <div className="panel-title-block">
          <h3 className="panel-title" id="top-partilha-titulo">
            Concentração do lucro
          </h3>
          <p className="panel-sub">Top 5 por lucro bruto · ano fiscal</p>
        </div>
        <span className="hero-chip">Top 5</span>
      </div>

      <div className="hero-big">{pct(share)}</div>
      <p className="hero-label">do lucro bruto</p>

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
                "#9fb6c9",
                "#d3dfea",
              ][index],
            }}
          />
        ))}
        <span style={{ flex: 1, background: "#efefef" }} />
      </div>

      <div className="hero-legend">
        {top.map((item, index) => (
          <span key={item.id}>
            <strong>{item.name}</strong> {pct(item.profitShare)}
            {index === 0 ? " · principal" : ""}
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
                  linha.category === menor
                    ? "var(--sinopia)"
                    : "var(--prussian)",
              }}
            />
          </div>
          <span className="bar-line-value">{pct(linha.margin)}</span>
        </div>
      ))}

      <p className="panel-note">
        {menor ? `${menor} tem a margem mais baixa. ` : ""}
        Margem = (preço − custo) ÷ preço.
      </p>
    </section>
  );
}
