"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SegmentedFilter } from "@/components/ui/SegmentedFilter";
import { dataRange, dayRange, monthRange, yearRange } from "@/lib/dates";
import { eur, int } from "@/lib/format";
import { topProductsByUnits, unitsByHourAndCategory } from "@/lib/stats";
import type { Produto, Venda } from "@/types";

type Periodo = "tudo" | "dia" | "mes" | "ano";

const OPCOES: ReadonlyArray<{ value: Periodo; label: string }> = [
  { value: "tudo", label: "Tudo" },
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

const CORES: Record<string, string> = {
  Bebidas: "#7e9cb2",
  Bolos: "#d95345",
  Pão: "#b9c8d5",
  Pastéis: "#142e43",
};

const CORES_EXTRA = ["#142e43", "#7e9cb2", "#b9c8d5", "#d95345"];

export function TopProducts({
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

  const porHora = useMemo(
    () => unitsByHourAndCategory(filtradas, produtos),
    [filtradas, produtos],
  );

  const dadosGrafico = useMemo(
    () =>
      porHora.horas.map((ponto) => ({
        hora: `${ponto.hour}h`,
        ...ponto.porCategoria,
      })),
    [porHora],
  );

  const maximo = top.length > 0 ? top[0].units : 0;

  return (
    <>
      <section className="card" aria-labelledby="sazonalidade-titulo">
        <div className="card-head">
          <div>
            <h3 className="card-title" id="sazonalidade-titulo">
              Sazonalidade
            </h3>
            <p className="card-sub">Unidades por categoria e hora do dia.</p>
          </div>
          <SegmentedFilter
            label="Filtrar vendas por período"
            options={OPCOES}
            value={periodo}
            onChange={setPeriodo}
          />
        </div>

        <div className="chart-legend" aria-hidden="true">
          {porHora.categorias.map((categoria, index) => (
            <span key={categoria}>
              <i
                style={{
                  background:
                    CORES[categoria] ?? CORES_EXTRA[index % CORES_EXTRA.length],
                }}
              />
              {categoria}
            </span>
          ))}
        </div>

        <div
          className="h-[240px] w-full"
          role="img"
          aria-label="Barras empilhadas com as unidades vendidas de cada categoria por hora do dia"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico}
              barCategoryGap="28%"
              margin={{ top: 10, right: 4, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="hora"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#89939d", fontSize: 10 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#89939d", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "#f1f2f3" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="chart-tooltip">
                      <strong>{label}</strong>
                      {payload.map((entry) => (
                        <div key={String(entry.dataKey)}>
                          {String(entry.dataKey)}: {int(Number(entry.value))} un
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {porHora.categorias.map((categoria, index) => (
                <Bar
                  key={categoria}
                  dataKey={categoria}
                  stackId="unidades"
                  fill={
                    CORES[categoria] ?? CORES_EXTRA[index % CORES_EXTRA.length]
                  }
                  maxBarSize={30}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="card-sub">
          {int(filtradas.length)} vendas ·{" "}
          {intervalo === null
            ? `${limite.from} a ${limite.to}`
            : `${intervalo.from} a ${intervalo.to}`}
        </p>
      </section>

      <section className="card" aria-labelledby="trafego-titulo">
        <div className="card-head">
          <div>
            <h3 className="card-title" id="trafego-titulo">
              Produtos de tráfego
            </h3>
            <p className="card-sub">Dez mais vendidos por unidades.</p>
          </div>
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
    </>
  );
}
