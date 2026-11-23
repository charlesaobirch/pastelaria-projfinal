"use client";

import { useMemo, useState } from "react";
import { DailyStems, RevenueLine } from "@/components/domain/Charts";
import { ArticleIcon } from "@/components/ui/ArticleIcon";
import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useData } from "@/hooks/useData";
import { dataRange } from "@/lib/dates";
import { EMPTY_FILTERS, filterSales } from "@/lib/filters";
import { FY2026, fiscalRangeLabel, monthYearLabel } from "@/lib/fiscal";
import { eur, int, pct } from "@/lib/format";
import {
  kpis,
  productStats,
  revenueByDay,
  revenueByMonth,
  revenueByWeekday,
} from "@/lib/stats";
import { stockAlerts, stockByLevel, stockValue } from "@/lib/stock";

export default function OverviewPage() {
  const { vendas, produtos, ingredientes, status, error } = useData();
  const [mes, setMes] = useState("");

  const fyVendas = useMemo(
    () =>
      filterSales(vendas, produtos, {
        ...EMPTY_FILTERS,
        from: FY2026.from,
        to: FY2026.to,
      }),
    [vendas, produtos],
  );

  const meses = useMemo(
    () => [...new Set(fyVendas.map((venda) => venda.date.slice(0, 7)))].sort(),
    [fyVendas],
  );
  const mesSelecionado = meses.includes(mes)
    ? mes
    : (meses[meses.length - 1] ?? "");
  const mesLabel = mesSelecionado
    ? monthYearLabel(`${mesSelecionado}-01`)
    : "—";
  const mesShort = mesLabel.split(" ")[0].toLocaleLowerCase("pt-PT");

  const mensal = useMemo(
    () => revenueByMonth(fyVendas, produtos),
    [fyVendas, produtos],
  );
  const diario = useMemo(
    () =>
      revenueByDay(fyVendas, produtos).filter((ponto) =>
        ponto.date.startsWith(mesSelecionado),
      ),
    [fyVendas, produtos, mesSelecionado],
  );
  const resumo = useMemo(() => kpis(fyVendas, produtos), [fyVendas, produtos]);
  const stats = useMemo(
    () => productStats(fyVendas, produtos),
    [fyVendas, produtos],
  );
  const semana = useMemo(
    () => revenueByWeekday(fyVendas, produtos),
    [fyVendas, produtos],
  );

  const alertas = useMemo(() => stockAlerts(ingredientes), [ingredientes]);
  const niveis = useMemo(() => stockByLevel(ingredientes), [ingredientes]);
  const fornecedores = useMemo(
    () => new Set(ingredientes.map((item) => item.supplier)).size,
    [ingredientes],
  );
  const produtosEmFalta = useMemo(
    () => produtos.filter((item) => item.stock < item.min_stock).length,
    [produtos],
  );

  const diaData = dataRange(fyVendas.map((venda) => venda.date));
  const periodo =
    diaData.from === null || diaData.to === null
      ? "Sem dados"
      : fiscalRangeLabel(diaData.from, diaData.to);

  const mediaDia =
    diario.length > 0
      ? diario.reduce((soma, ponto) => soma + ponto.revenue, 0) / diario.length
      : 0;
  const melhorDia = diario.reduce(
    (melhor, ponto) =>
      !melhor || ponto.revenue > melhor.revenue ? ponto : melhor,
    diario[0],
  );
  const piorDia = diario.reduce(
    (pior, ponto) => (!pior || ponto.revenue < pior.revenue ? ponto : pior),
    diario[0],
  );
  const melhorMes = mensal.reduce(
    (melhor, mes) => (!melhor || mes.revenue > melhor.revenue ? mes : melhor),
    mensal[0],
  );

  const top5 = stats.slice(0, 5);
  const lucroTotal = stats.reduce((soma, item) => soma + item.profit, 0);
  const top5Share =
    lucroTotal > 0
      ? (top5.reduce((soma, item) => soma + item.profit, 0) / lucroTotal) * 100
      : 0;
  const top3Share =
    lucroTotal > 0
      ? (stats.slice(0, 3).reduce((soma, item) => soma + item.profit, 0) /
          lucroTotal) *
        100
      : 0;

  const fimDeSemana =
    semana.length >= 7
      ? (semana[5].revenuePerDay + semana[6].revenuePerDay) / 2
      : 0;
  const diasUteis =
    semana.slice(0, 5).reduce((soma, ponto) => soma + ponto.revenuePerDay, 0) /
    5;
  const uplift = diasUteis > 0 ? (fimDeSemana / diasUteis - 1) * 100 : 0;

  return (
    <main className="page">
      <PageHeader
        title="Visão geral"
        description="Receita, produtos e alertas que explicam o negócio"
        range={periodo}
      />

      {status === "error" && (
        <p className="notice" role="alert">
          <strong>Não foi possível ler os dados.</strong> {error}
        </p>
      )}
      {status !== "ready" && status !== "error" && (
        <p className="notice">A carregar dados da pastelaria…</p>
      )}

      <div className="grid-row grid-row--overview">
        <section className="panel" aria-labelledby="diario-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="diario-titulo">
                Receita diária
              </h2>
              <p className="panel-sub">
                {mesLabel} · receita de cada dia do mês
              </p>
            </div>
            <label className="month-picker">
              <span className="sr-only">Filtrar por mês</span>
              <select
                className="select-pill"
                value={mesSelecionado}
                onChange={(event) => setMes(event.target.value)}
              >
                {meses.map((valor) => (
                  <option key={valor} value={valor}>
                    {monthYearLabel(`${valor}-01`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="stat-strip">
            <div className="stat-block">
              <span className="stat-label">Média do mês</span>
              <span className="stat-value stat-value--md">{eur(mediaDia)}</span>
            </div>
            <div className="stat-block">
              <span className="stat-label">Melhor dia</span>
              <span
                className="stat-value stat-value--md"
                style={{ color: "var(--verde)" }}
              >
                {melhorDia ? eur(melhorDia.revenue) : "—"}
              </span>
              <span className="stat-sub">
                {melhorDia
                  ? `${Number(melhorDia.date.slice(8))} ${mesShort}`
                  : ""}
              </span>
            </div>
            <div className="stat-block">
              <span className="stat-label">Dia mais fraco</span>
              <span
                className="stat-value stat-value--md"
                style={{ color: "var(--sinopia)" }}
              >
                {piorDia ? eur(piorDia.revenue) : "—"}
              </span>
              <span className="stat-sub">
                {piorDia ? `${Number(piorDia.date.slice(8))} ${mesShort}` : ""}
              </span>
            </div>
          </div>

          <DailyStems
            data={diario}
            monthLabel={mesLabel}
            monthShort={mesShort}
          />
        </section>

        <section className="panel panel--hero" aria-labelledby="resumo-titulo">
          <span className="hero-chip">
            {FY2026.label.split(" · ")[1]} {FY2026.label.split(" · ")[0]}
          </span>
          <div>
            <div className="hero-number">{pct(resumo.margin)}</div>
            <p className="hero-label">margem bruta no ano fiscal</p>
          </div>
          <h2 className="hero-insight-title" id="resumo-titulo">
            Leitura rápida
          </h2>
          <p className="hero-insight-copy">
            O {stats[0]?.name ?? "produto principal"} gera{" "}
            {pct(stats[0]?.profitShare ?? 0)} do lucro e o fim de semana vende +
            {pct(uplift)} por dia. O pico do mês foi a{" "}
            {melhorDia ? Number(melhorDia.date.slice(8)) : "—"} {mesShort}.
          </p>
          <div className="hero-rule" />
          <div className="hero-metrics">
            <div className="hero-metric">
              <span className="hero-metric-label">Receita</span>
              <span className="hero-metric-value">{eur(resumo.revenue)}</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-label">Lucro bruto</span>
              <span className="hero-metric-value">{eur(resumo.profit)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid-row grid-row--sales">
        <section className="panel" aria-labelledby="top5-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="top5-titulo">
                Top 5 por lucro
              </h2>
              <p className="panel-sub">
                Ano fiscal 2026 ·{" "}
                {int(mensal.reduce((soma, mes) => soma + mes.days, 0))} dias
              </p>
            </div>
            <span className="meta-pill meta-pill--tint">
              {pct(top5Share)} do lucro
            </span>
          </div>

          <div className="list-rows">
            {top5.map((produto, index) => (
              <div className="list-row" key={produto.id}>
                <span
                  className={`rank-badge${index === 0 ? " rank-badge--first" : ""}`}
                >
                  {index + 1}
                </span>
                <ArticleIcon name={produto.name} category={produto.category} />
                <span className="list-name">
                  <strong>{produto.name}</strong>
                  <span>{produto.category}</span>
                </span>
                <span className="list-units">{int(produto.units)} un</span>
                <span className="list-value">{eur(produto.profit)}</span>
              </div>
            ))}
          </div>

          <p className="panel-note">
            {top5
              .slice(0, 3)
              .map((item) => item.name)
              .join(", ")}{" "}
            valem {pct(top3Share)} do lucro bruto.
          </p>
        </section>

        <section className="panel" aria-labelledby="mensal-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="mensal-titulo">
                Receita por mês
              </h2>
              <p className="panel-sub">
                Ano fiscal 2026 · {int(mensal.length)} meses
              </p>
            </div>
            <div className="stat-block">
              <span className="stat-label stat-label--caps">Total</span>
              <span className="stat-value stat-value--md">
                {eur(resumo.revenue)}
              </span>
            </div>
          </div>

          <RevenueLine
            data={mensal.map((mes) => ({
              label: mes.label.replace("/", " "),
              value: mes.revenue,
            }))}
            label="Receita mensal do ano fiscal"
          />

          <div className="panel-foot">
            <span className="panel-note panel-note--green">
              Pico em {melhorMes?.label.split("/")[0] ?? "—"} ·{" "}
              {melhorMes ? eur(melhorMes.revenue) : "—"}
            </span>
            <span>
              Média {eur(resumo.revenue / Math.max(mensal.length, 1))}/mês
            </span>
          </div>
        </section>
      </div>

      <section className="panel" aria-labelledby="stock-titulo">
        <div className="panel-head">
          <div className="panel-title-block">
            <h2 className="panel-title" id="stock-titulo">
              Stock abaixo do mínimo
            </h2>
            <p className="panel-sub">
              Fotografia de 31 out 2026 · {int(ingredientes.length)}{" "}
              ingredientes e {int(produtos.length)} produtos
            </p>
          </div>
          <span className="meta-pill meta-pill--alert">
            <span className="meta-dot" /> {int(alertas.length)} ingredientes
          </span>
        </div>

        <div className="split-panel">
          <div className="stat-block">
            <div className="mini-stat-value">{int(produtosEmFalta)}</div>
            <p className="mini-stat-label">produtos abaixo do mínimo</p>
            <p className="mini-stat-copy">
              {int(produtos.length - produtosEmFalta)} produtos acima do limiar
              definido.
            </p>
          </div>

          <div className="split-divider" />

          <div className="list-rows">
            {alertas.slice(0, 5).map((item) => (
              <div className="stock-alert-row" key={item.id}>
                <span
                  className={`stock-alert-dot${item.status === "esgotado" ? " stock-alert-dot--out" : ""}`}
                />
                <span className="stock-alert-name">{item.name}</span>
                <span className="stock-alert-stock">
                  {int(item.stock)} / {int(item.min_stock)} {item.unit}
                </span>
                <span
                  className={`status-pill${item.status === "esgotado" ? " status-pill--out" : ""}`}
                >
                  {item.status === "esgotado" ? "Esgotado" : "Baixo"}
                </span>
              </div>
            ))}
            {alertas.length === 0 && (
              <p className="panel-note">Sem alertas de stock.</p>
            )}
          </div>

          <div className="stat-block">
            <span className="stat-label stat-label--caps">Valor de stock</span>
            <span className="stat-value">{eur(stockValue(ingredientes))}</span>
            <span className="stat-sub">{int(fornecedores)} fornecedores</span>
            <span className="panel-note">
              {int(niveis.baixo + niveis.esgotado)} em atenção
            </span>
          </div>
        </div>

        <p className="panel-note">
          O stock é um retrato: não há histórico de consumo nem reconciliação
          com as vendas.
        </p>
      </section>

      <PageFooter />
    </main>
  );
}
