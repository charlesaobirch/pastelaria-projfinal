"use client";

import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { eur } from "@/lib/format";

/** Linha de receita com área preenchida, sem eixo Y como no modelo. */
export function RevenueLine({
  data,
  height = 198,
  label = "Receita por mês",
}: {
  data: { label: string; value: number }[];
  height?: number;
  label?: string;
}) {
  const gradientId = `receita-${useId().replace(/:/g, "")}`;

  return (
    <div className="line-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 12, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--indigo)" stopOpacity={0.3} />
              <stop
                offset="100%"
                stopColor="var(--indigo)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--grid-soft)" />
          <XAxis
            dataKey="label"
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-soft)", fontSize: 9 }}
            height={22}
          />
          <Tooltip
            formatter={(value) => eur(Number(value))}
            contentStyle={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--surface)",
              boxShadow: "var(--shell)",
              color: "var(--prussian)",
              fontSize: 11,
            }}
            labelStyle={{ color: "var(--prussian)", fontWeight: 700 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Receita"
            stroke="var(--indigo)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={{ r: 2.5, fill: "var(--indigo)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--prussian)", strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras verticais com a série de destaque a prussian. */
export function ValueBars({
  data,
  highlight = [],
  narrow = false,
  height = 168,
  label = "Gráfico de barras",
}: {
  data: { label: string; value: number }[];
  highlight?: string[];
  narrow?: boolean;
  height?: number;
  label?: string;
}) {
  const max = Math.max(...data.map((ponto) => ponto.value), 1);

  return (
    <div className="bar-chart" style={{ height }} role="img" aria-label={label}>
      {data.map((ponto) => {
        const ativo = highlight.includes(ponto.label);

        return (
          <div className="bar-col" key={ponto.label}>
            <div className="bar-track">
              <div
                className={`bar-fill${narrow ? " bar-fill--narrow" : ""}${ativo ? " bar-fill--active" : ""}`}
                style={{ height: `${Math.max(2, (ponto.value / max) * 100)}%` }}
                title={`${ponto.label}: ${eur(ponto.value)}`}
              />
            </div>
            <span className={`bar-label${ativo ? " bar-label--active" : ""}`}>
              {ponto.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Hastes diárias com tooltip; melhor e pior dia assinalados na cor. */
export function DailyStems({
  data,
  monthLabel,
  monthShort,
}: {
  data: { date: string; revenue: number }[];
  monthLabel: string;
  monthShort: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="panel-note">Sem vendas no mês.</p>;
  }

  const max = Math.max(...data.map((ponto) => ponto.revenue), 1);
  const melhor = data.reduce((a, b) => (b.revenue > a.revenue ? b : a));
  const pior = data.reduce((a, b) => (b.revenue < a.revenue ? b : a));
  const labelIndexes = [1, 6, 12, 18, 24, 30].filter((i) => i < data.length);

  return (
    <div className="stem-chart-wrap">
      <div
        className="stem-chart"
        role="img"
        aria-label={`Receita de cada dia de ${monthLabel}`}
      >
        {data.map((ponto, index) => {
          const isBest = ponto.date === melhor.date;
          const isWorst = ponto.date === pior.date;
          const altura = Math.max(3, (ponto.revenue / max) * 88);
          const dia = Number(ponto.date.slice(8));

          return (
            <div className="stem-col" key={ponto.date}>
              <button
                type="button"
                className="stem-hit"
                aria-label={`${dia} ${monthShort}: ${eur(ponto.revenue)}`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
              >
                <span className="stem-wrap" style={{ height: `${altura}%` }}>
                  <span
                    className={`stem${isBest ? " stem--best" : isWorst ? " stem--worst" : ""}`}
                  />
                  <span
                    className={`stem-dot${isBest ? " stem-dot--best" : isWorst ? " stem-dot--worst" : ""}`}
                  />
                </span>
              </button>
              {labelIndexes.includes(index) && (
                <span
                  className="chart-labels"
                  style={{
                    position: "absolute",
                    bottom: -22,
                    width: 36,
                    marginLeft: -17,
                    display: "block",
                  }}
                >
                  {dia} {monthShort}
                </span>
              )}
              {hovered === index && (
                <span
                  className="stem-tooltip"
                  style={{ bottom: `calc(${altura}% + 12px)` }}
                >
                  <span>
                    {dia} {monthShort}
                  </span>
                  <strong>{eur(ponto.revenue)}</strong>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="chart-baseline" />
    </div>
  );
}

/** Mapa de calor dia da semana × hora. */
export function Heatmap({
  matrix,
  weekdays,
  hours,
}: {
  matrix: number[][];
  weekdays: string[];
  hours: number[];
}) {
  const max = Math.max(...matrix.flat(), 1);

  function cor(valor: number): string {
    if (valor <= 0) return "var(--heat-0)";
    const r = valor / max;
    if (r <= 0.25) return "var(--heat-1)";
    if (r <= 0.5) return "var(--heat-2)";
    if (r <= 0.75) return "var(--heat-3)";
    return "var(--heat-4)";
  }

  return (
    <div
      className="heatmap"
      role="img"
      aria-label="Calor de receita por dia e hora"
    >
      <div className="heatmap-row" style={{ marginBottom: 2 }}>
        <span />
        {hours.map((hour) => (
          <span
            className="heatmap-label"
            key={hour}
            style={{ textAlign: "center" }}
          >
            {hour}
          </span>
        ))}
      </div>
      {matrix.map((row, weekday) => (
        <div className="heatmap-row" key={weekdays[weekday]}>
          <span className="heatmap-label">{weekdays[weekday]}</span>
          {row.map((valor, hour) => (
            <span
              className="heatmap-cell"
              key={hours[hour]}
              style={{ background: cor(valor) }}
              title={`${weekdays[weekday]} ${hours[hour]}h: ${eur(valor)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
