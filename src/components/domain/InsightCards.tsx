"use client";

import { eur, int, pct } from "@/lib/format";
import { categoryStats, kpis } from "@/lib/stats";
import type { Produto, Venda } from "@/types";

export function GlobalMarginCard({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const resumo = kpis(vendas, produtos);

  return (
    <section className="metric-card" aria-label="Margem global">
      <p className="metric-label">Margem global</p>
      <p className="metric-value">{pct(resumo.margin)}</p>
      <p className="metric-note">Receita menos custo sobre as vendas.</p>
      <p className="metric-foot">
        {eur(resumo.revenue)} de receita · {int(resumo.lines)} vendas
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
    <section className="card" aria-labelledby="margem-categoria-titulo">
      <div className="card-head">
        <div>
          <h3 className="card-title" id="margem-categoria-titulo">
            Margem por categoria
          </h3>
          <p className="card-sub">Percentagem sobre a receita de cada categoria.</p>
        </div>
      </div>

      {linhas.length === 0 && <p className="empty">Sem vendas no período.</p>}

      {linhas.map((linha) => (
        <div className="bar-row" key={linha.category}>
          <span className="bar-name">{linha.category}</span>
          <span className="bar-value">{pct(linha.margin)}</span>
          <div
            className="bar-track"
            role="img"
            aria-label={`${linha.category}: margem de ${pct(linha.margin)}`}
          >
            <div
              className={
                linha.category === menor
                  ? "bar-fill bar-fill--warn"
                  : "bar-fill bar-fill--soft"
              }
              style={{ width: `${Math.max(0, Math.min(100, linha.margin))}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
