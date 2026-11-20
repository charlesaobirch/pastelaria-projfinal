"use client";

import { useMemo, useState } from "react";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import {
  dataRange,
  dayRange,
  monthRange,
  yearRange,
} from "@/lib/dates";
import { eur, int } from "@/lib/format";
import { topProductsByUnits } from "@/lib/stats";
import type { Produto, Venda } from "@/types";

type Periodo = "tudo" | "dia" | "mes" | "ano";

const OPCOES: ReadonlyArray<{ value: Periodo; label: string }> = [
  { value: "tudo", label: "Tudo" },
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

export function TrafficProducts({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const [periodo, setPeriodo] = useState<Periodo>("tudo");

  const limite = useMemo(
    () => dataRange(vendas.map((venda) => venda.date)),
    [vendas],
  );

  const intervalo = useMemo(() => {
    if (periodo === "tudo" || limite.to === null) return null;
    if (periodo === "dia") return dayRange(limite.to);
    if (periodo === "mes") return monthRange(limite.to.slice(0, 7));
    return yearRange(Number(limite.to.slice(0, 4)));
  }, [periodo, limite.to]);

  const filtradas = useMemo(
    () =>
      intervalo === null
        ? vendas
        : vendas.filter(
            (venda) =>
              venda.date >= intervalo.from && venda.date <= intervalo.to,
          ),
    [vendas, intervalo],
  );

  const top = useMemo(
    () => topProductsByUnits(filtradas, produtos, 10),
    [filtradas, produtos],
  );

  const maximo = top.length > 0 ? top[0].units : 0;

  return (
    <section className="card" id="trafego" aria-labelledby="trafego-titulo">
      <div className="card-head">
        <div>
          <h3 className="card-title" id="trafego-titulo">
            Produtos de tráfego
          </h3>
          <p className="card-sub">
            Dez mais vendidos por unidades.
            {top[0] ? ` Líder: ${top[0].name} (${int(top[0].units)} un).` : ""}
          </p>
        </div>
        <SegmentedFilter
          label="Filtrar vendas por período"
          options={OPCOES}
          value={periodo}
          onChange={setPeriodo}
        />
      </div>

      {top.length === 0 && <p className="empty">Sem vendas no período.</p>}

      {top.map((produto, index) => (
        <div className="rank-row" key={produto.id}>
          <span className="rank-index">{index + 1}</span>
          <span className="rank-name">
            {produto.name} <span>· {produto.category}</span>
          </span>
          <span className="rank-value">
            {int(produto.units)} un · {eur(produto.revenue)}
          </span>
          <span
            className="rank-bar"
            role="img"
            aria-label={`${produto.name}: ${int(produto.units)} unidades`}
          >
            <span
              style={{
                width: `${maximo > 0 ? (produto.units / maximo) * 100 : 0}%`,
              }}
            />
          </span>
        </div>
      ))}
    </section>
  );
}
