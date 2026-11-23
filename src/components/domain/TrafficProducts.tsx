"use client";

import { eur, int } from "@/lib/format";
import { productStats, topProductsByUnits } from "@/lib/stats";
import type { Produto, Venda } from "@/types";

/** Produtos com muito volume e pouco lucro por unidade. */
export function TrafficProducts({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const trafego = topProductsByUnits(vendas, produtos, 10)
    .map((produto) => ({
      ...produto,
      profitPerUnit: produto.units > 0 ? produto.profit / produto.units : 0,
    }))
    .sort((a, b) => a.profitPerUnit - b.profitPerUnit)
    .slice(0, 2);
  const maxUnidades = Math.max(...trafego.map((produto) => produto.units), 1);
  const todos = productStats(vendas, produtos);
  const porUnidades = [...todos].sort((a, b) => b.units - a.units);
  const porReceita = [...todos].sort((a, b) => b.revenue - a.revenue);
  const principal = trafego[0];
  const lugarUnidades = principal
    ? porUnidades.findIndex((item) => item.id === principal.id) + 1
    : 0;
  const lugarReceita = principal
    ? porReceita.findIndex((item) => item.id === principal.id) + 1
    : 0;

  return (
    <section className="panel" aria-labelledby="trafego-titulo">
      <div className="panel-head">
        <div className="panel-title-block">
          <h3 className="panel-title" id="trafego-titulo">
            Produtos de tráfego
          </h3>
          <p className="panel-sub">Volume alto, margem baixa</p>
        </div>
      </div>

      {trafego.map((produto, index) => (
        <div
          className={`traffic-item${index > 0 ? " traffic-item--secondary" : ""}`}
          key={produto.id}
        >
          <div className="traffic-top">
            <span className="traffic-name">{produto.name}</span>
            <span className="traffic-units">{int(produto.units)} un</span>
          </div>
          <div className="traffic-bottom">
            <span className="traffic-profit">{eur(produto.profit)}</span>
            <span className="traffic-unit">
              {eur(produto.profitPerUnit)} / un
            </span>
          </div>
          <span className="traffic-track" aria-hidden="true">
            <span
              className="traffic-bar"
              style={{ width: `${(produto.units / maxUnidades) * 100}%` }}
            />
          </span>
        </div>
      ))}

      <p className="panel-note product-card-note">
        Servem para acompanhar o café, não para rentabilizar sozinhos.
      </p>
      {principal && (
        <p className="panel-note product-card-note">
          {principal.name} é o {lugarUnidades}.º em unidades e o {lugarReceita}
          .º em receita.
        </p>
      )}
    </section>
  );
}
