"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  Bebidas: "#3f7d78",
  Bolos: "#8a5a2b",
  Pão: "#b08346",
  Pastéis: "#c4693e",
};

const CORES_EXTRA = ["#5b7a9d", "#7c6090", "#6f7f45", "#9b6370"];

export function TopProducts({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const [periodo, setPeriodo] = useState<Periodo>("tudo");

  const limite = useMemo(() => dataRange(vendas.map((venda) => venda.date)), [vendas]);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedFilter
          label="Filtrar vendas por período"
          options={OPCOES}
          value={periodo}
          onChange={setPeriodo}
        />
        <p className="text-xs text-[var(--muted)]">
          {int(filtradas.length)} vendas
          {intervalo === null
            ? ` · ${limite.from} a ${limite.to}`
            : ` · ${intervalo.from} a ${intervalo.to}`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold">
            Unidades por categoria e hora
          </h3>
          <div
            className="h-[300px] w-full"
            role="img"
            aria-label="Barras empilhadas com as unidades vendidas de cada categoria por hora do dia"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosGrafico}
                margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--line)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hora"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent-soft)", opacity: 0.4 }}
                  formatter={(value) => [`${int(Number(value))} un`, "Unidades"]}
                />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
                />
                {porHora.categorias.map((categoria, index) => (
                  <Bar
                    key={categoria}
                    dataKey={categoria}
                    stackId="unidades"
                    fill={CORES[categoria] ?? CORES_EXTRA[index % CORES_EXTRA.length]}
                    maxBarSize={38}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-sm font-semibold">
            Dez produtos mais vendidos
          </h3>
          {top.length === 0 ? (
            <p className="notice">Não há vendas neste período.</p>
          ) : (
            <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {top.map((produto, index) => (
                <li
                  key={produto.id}
                  className="flex items-baseline gap-3 py-2 text-sm"
                >
                  <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {produto.name}
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {produto.category}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {int(produto.units)} un
                  </span>
                  <span className="w-20 shrink-0 text-right tabular-nums text-[var(--muted)]">
                    {eur(produto.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
