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
import {
  dataRange,
  dayRange,
  monthKeysBetween,
  monthLabel,
  monthRange,
  yearRange,
} from "@/lib/dates";
import { eur, int } from "@/lib/format";
import {
  type MonthlyUnitsPoint,
  monthlyUnitsByProduct,
  topProductsByUnits,
} from "@/lib/stats";
import type { Produto, Venda } from "@/types";

type Periodo = "tudo" | "dia" | "mes" | "ano";

const OPCOES: ReadonlyArray<{ value: Periodo; label: string }> = [
  { value: "tudo", label: "Tudo" },
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

function estacaoDoMes(mes: number): string {
  if ([6, 7, 8].includes(mes)) return "no verão";
  if ([12, 1, 2].includes(mes)) return "no inverno";
  if ([3, 4, 5].includes(mes)) return "na primavera";
  return "no outono";
}

export function TopProducts({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const [produtoId, setProdutoId] = useState<number | null>(null);

  const limite = useMemo(
    () => dataRange(vendas.map((venda) => venda.date)),
    [vendas],
  );

  const meses = useMemo(
    () =>
      limite.from === null || limite.to === null
        ? []
        : monthKeysBetween(limite.from, limite.to),
    [limite.from, limite.to],
  );

  const produtoSelecionadoId =
    produtoId ??
    produtos.find((produto) => produto.name === "Cappuccino")?.id ??
    produtos[0]?.id ??
    null;

  const produtoSelecionado =
    produtos.find((produto) => produto.id === produtoSelecionadoId) ?? null;

  const serie = useMemo(
    () =>
      produtoSelecionadoId === null
        ? []
        : monthlyUnitsByProduct(vendas, produtoSelecionadoId, meses),
    [vendas, produtoSelecionadoId, meses],
  );

  const pico = useMemo(
    () =>
      serie.reduce<MonthlyUnitsPoint | null>(
        (melhor, ponto) =>
          melhor === null || ponto.units > melhor.units ? ponto : melhor,
        null,
      ),
    [serie],
  );

  const totalUnidades = useMemo(
    () => serie.reduce((soma, ponto) => soma + ponto.units, 0),
    [serie],
  );

  const dadosSazonalidade = useMemo(
    () =>
      serie.map((ponto) => ({
        mes: monthLabel(ponto.month),
        unidades: ponto.units,
        normal: ponto.month === pico?.month ? 0 : ponto.units,
        destaque: ponto.month === pico?.month ? ponto.units : 0,
      })),
    [serie, pico],
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
    <>
      <section className="card" aria-labelledby="sazonalidade-titulo">
        <div className="card-head">
          <div>
            <h3 className="card-title" id="sazonalidade-titulo">
              Sazonalidade de um produto
            </h3>
            <p className="card-sub">
              {meses.length > 0
                ? `Unidades vendidas por mês · ${monthLabel(meses[0])} a ${monthLabel(meses[meses.length - 1])}`
                : "Unidades vendidas por mês"}
            </p>
          </div>
          <label className="select-wrap">
            <span className="sr-only">Escolher produto</span>
            <select
              className="select"
              value={produtoSelecionadoId ?? ""}
              onChange={(event) => setProdutoId(Number(event.target.value))}
            >
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="h-[240px] w-full"
          role="img"
          aria-label={`Barras mensais das unidades vendidas de ${produtoSelecionado?.name ?? "produto"}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosSazonalidade}
              barCategoryGap="28%"
              margin={{ top: 10, right: 4, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="mes"
                interval={0}
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
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const mes = String(payload[0]?.payload?.mes ?? "");
                  const unidades = Number(payload[0]?.payload?.unidades ?? 0);

                  return (
                    <div className="chart-tooltip">
                      <strong>{mes}</strong>
                      <div>{int(unidades)} un</div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="normal"
                stackId="meses"
                fill="#b9c8d5"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                dataKey="destaque"
                stackId="meses"
                fill="#d95345"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="card-sub">
          {pico && produtoSelecionado ? (
            <>
              Pico {estacaoDoMes(Number(pico.month.slice(5)))}:{" "}
              <strong>{monthLabel(pico.month)}</strong> · {int(pico.units)} un.
              Total: {int(totalUnidades)} un.
            </>
          ) : (
            "Sem vendas no período."
          )}
        </p>
      </section>

      <section className="card" aria-labelledby="trafego-titulo">
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
    </>
  );
}
