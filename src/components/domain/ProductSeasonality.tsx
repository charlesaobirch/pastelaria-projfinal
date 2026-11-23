"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { dataRange, monthKeysBetween, monthLabel } from "@/lib/dates";
import { int } from "@/lib/format";
import { type MonthlyUnitsPoint, monthlyUnitsByProduct } from "@/lib/stats";
import type { Produto, Venda } from "@/types";

export function ProductSeasonality({
  vendas,
  produtos,
}: {
  vendas: Venda[];
  produtos: Produto[];
}) {
  const [produtoId, setProdutoId] = useState<number | null>(null);

  const meses = useMemo(() => {
    const limite = dataRange(vendas.map((venda) => venda.date));
    return limite.from === null || limite.to === null
      ? []
      : monthKeysBetween(limite.from, limite.to);
  }, [vendas]);

  const selecionadoId =
    produtoId ??
    produtos.find((produto) => produto.name === "Bolo de laranja")?.id ??
    produtos[0]?.id ??
    null;
  const selecionado =
    produtos.find((produto) => produto.id === selecionadoId) ?? null;

  const serie = useMemo(
    () =>
      selecionadoId === null
        ? []
        : monthlyUnitsByProduct(vendas, selecionadoId, meses),
    [vendas, selecionadoId, meses],
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
  const minimo = useMemo(
    () =>
      serie.reduce<MonthlyUnitsPoint | null>(
        (menor, ponto) =>
          menor === null || ponto.units < menor.units ? ponto : menor,
        null,
      ),
    [serie],
  );

  const dados = serie.map((ponto) => ({
    mes: monthLabel(ponto.month),
    unidades: ponto.units,
    normal: ponto.month === pico?.month ? 0 : ponto.units,
    destaque: ponto.month === pico?.month ? ponto.units : 0,
  }));

  return (
    <section className="panel" aria-labelledby="sazonalidade-titulo">
      <div className="panel-head">
        <div className="panel-title-block">
          <h3 className="panel-title" id="sazonalidade-titulo">
            Sazonalidade de um produto
          </h3>
          <p className="panel-sub">
            {selecionado?.name ?? "Produto"} · unidades por mês
          </p>
        </div>
        <label className="select-pill">
          <span className="sr-only">Escolher produto</span>
          <select
            value={selecionadoId ?? ""}
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
        className="line-chart"
        role="img"
        aria-label={`Unidades mensais de ${selecionado?.name ?? "produto"}`}
      >
        <ResponsiveContainer width="100%" height={170}>
          <BarChart
            data={dados}
            barCategoryGap="28%"
            margin={{ top: 12, right: 4, bottom: 0, left: -22 }}
          >
            <XAxis
              dataKey="mes"
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#5e6a76", fontSize: 9 }}
              height={22}
            />
            <Tooltip
              cursor={{ fill: "#f1f4f7" }}
              formatter={(value) => [`${int(Number(value))} un`, "Unidades"]}
              contentStyle={{
                border: "1px solid #e1e6ea",
                borderRadius: 10,
                background: "#ffffff",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="normal"
              stackId="meses"
              fill="#c3ced8"
              radius={[4, 4, 0, 0]}
              maxBarSize={26}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="normal"
                position="top"
                formatter={(value) =>
                  Number(value) > 0 ? int(Number(value)) : ""
                }
                style={{ fill: "#224766", fontSize: 9, fontWeight: 700 }}
              />
            </Bar>
            <Bar
              dataKey="destaque"
              stackId="meses"
              fill="#122435"
              radius={[4, 4, 0, 0]}
              maxBarSize={26}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="destaque"
                position="top"
                formatter={(value) =>
                  Number(value) > 0 ? int(Number(value)) : ""
                }
                style={{ fill: "#224766", fontSize: 9, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="panel-sub panel-sub--indigo">
        {pico && minimo ? (
          <>
            {int(pico.units)} un em {monthLabel(pico.month)} contra{" "}
            {int(minimo.units)} em {monthLabel(minimo.month)}.
          </>
        ) : (
          "Sem vendas no período."
        )}
      </p>
      <p className="panel-note">Nov–Dez 2025 · Jan–Out 2026</p>
    </section>
  );
}
