"use client";

import { useMemo, useState } from "react";
import { Heatmap, RevenueLine, ValueBars } from "@/components/domain/Charts";
import { ArticleIcon } from "@/components/ui/ArticleIcon";
import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useData } from "@/hooks/useData";
import { monthRange, parseDate, weekdayIndex, weekdayLabel } from "@/lib/dates";
import { EMPTY_FILTERS, filterSales } from "@/lib/filters";
import { FY2025, FY2026, fiscalRangeLabel, monthYearLabel } from "@/lib/fiscal";
import { eur, int, pct } from "@/lib/format";
import {
  kpis,
  paymentStats,
  productStats,
  revenueByDay,
  revenueByHour,
  revenueByMonth,
  revenueByWeekday,
} from "@/lib/stats";
import type { Produto, Venda } from "@/types";

type Ano = "2026" | "2025";
type Granularidade = "ano" | "mes";

const HORAS = Array.from({ length: 13 }, (_, index) => index + 7);
const DIAS = Array.from({ length: 7 }, (_, index) => weekdayLabel(index));

function upliftFimDeSemana(vendas: Venda[], produtos: Produto[]): number {
  const semana = revenueByWeekday(vendas, produtos);
  const fim = (semana[5].revenuePerDay + semana[6].revenuePerDay) / 2;
  const uteis =
    semana.slice(0, 5).reduce((soma, ponto) => soma + ponto.revenuePerDay, 0) /
    5;
  return uteis > 0 ? (fim / uteis - 1) * 100 : 0;
}

function delta(atual: number, anterior: number): number {
  return anterior > 0 ? (atual / anterior - 1) * 100 : 0;
}

export default function VendasPage() {
  const { vendas, produtos, status, error } = useData();
  const [ano, setAno] = useState<Ano>("2026");
  const [granularidade, setGranularidade] = useState<Granularidade>("ano");
  const [mes, setMes] = useState("");
  const [pagamento, setPagamento] = useState("todos");
  const [categoria, setCategoria] = useState("todas");

  const janela = ano === "2026" ? FY2026 : FY2025;
  const meses = useMemo(
    () =>
      revenueByMonth(
        filterSales(vendas, produtos, {
          ...EMPTY_FILTERS,
          from: janela.from,
          to: janela.to,
        }),
        produtos,
      ).map((ponto) => ponto.month),
    [vendas, produtos, janela.from, janela.to],
  );
  const mesSelecionado = meses.includes(mes)
    ? mes
    : (meses[meses.length - 1] ?? "");
  const mesLabel = mesSelecionado
    ? monthYearLabel(`${mesSelecionado}-01`)
    : "—";
  const intervalo =
    granularidade === "mes" && mesSelecionado
      ? monthRange(mesSelecionado)
      : janela;
  const metodos = useMemo(
    () => [...new Set(vendas.map((venda) => venda.payment_method))].sort(),
    [vendas],
  );
  const categorias = useMemo(
    () =>
      [...new Set(produtos.map((produto) => produto.category))].sort((a, b) =>
        a.localeCompare(b, "pt-PT"),
      ),
    [produtos],
  );

  const filtradas = useMemo(
    () =>
      filterSales(vendas, produtos, {
        ...EMPTY_FILTERS,
        from: intervalo.from,
        to: intervalo.to,
        payment: pagamento === "todos" ? null : pagamento,
        category: categoria === "todas" ? null : categoria,
      }),
    [vendas, produtos, intervalo.from, intervalo.to, pagamento, categoria],
  );

  const fy26 = useMemo(
    () =>
      filterSales(vendas, produtos, {
        ...EMPTY_FILTERS,
        from: FY2026.from,
        to: FY2026.to,
      }),
    [vendas, produtos],
  );
  const fy25 = useMemo(
    () =>
      filterSales(vendas, produtos, {
        ...EMPTY_FILTERS,
        from: FY2025.from,
        to: FY2025.to,
      }),
    [vendas, produtos],
  );

  const resumo = useMemo(
    () => kpis(filtradas, produtos),
    [filtradas, produtos],
  );
  const mensal = useMemo(
    () => revenueByMonth(filtradas, produtos),
    [filtradas, produtos],
  );
  const diario = useMemo(
    () => revenueByDay(filtradas, produtos),
    [filtradas, produtos],
  );
  const semana = useMemo(
    () => revenueByWeekday(filtradas, produtos),
    [filtradas, produtos],
  );
  const horas = useMemo(
    () => revenueByHour(filtradas, produtos),
    [filtradas, produtos],
  );
  const pagamentos = useMemo(() => paymentStats(filtradas), [filtradas]);
  const produtosStats = useMemo(
    () => productStats(filtradas, produtos),
    [filtradas, produtos],
  );

  const metadeProdutos = Math.ceil(produtosStats.length / 2);
  const blocosProdutos = [
    {
      key: "principais",
      linhas: produtosStats.slice(0, metadeProdutos),
    },
    {
      key: "restantes",
      linhas: produtosStats.slice(metadeProdutos),
    },
  ];

  const k26 = useMemo(() => kpis(fy26, produtos), [fy26, produtos]);
  const k25 = useMemo(() => kpis(fy25, produtos), [fy25, produtos]);
  const dias26 = useMemo(
    () => new Set(fy26.map((venda) => venda.date)).size,
    [fy26],
  );
  const dias25 = useMemo(
    () => new Set(fy25.map((venda) => venda.date)).size,
    [fy25],
  );
  const diasFiltrados = useMemo(
    () => new Set(filtradas.map((venda) => venda.date)).size,
    [filtradas],
  );

  const melhorDia = diario.reduce(
    (melhor, ponto) =>
      !melhor || ponto.revenue > melhor.revenue ? ponto : melhor,
    diario[0],
  );
  const picoMes = mensal.reduce(
    (melhor, mes) => (!melhor || mes.revenue > melhor.revenue ? mes : melhor),
    mensal[0],
  );
  const picoMesNome = picoMes
    ? new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(
        parseDate(`${picoMes.month}-01`),
      )
    : null;
  const picoHoras = [...horas]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 2);
  const picoHorasLabel = picoHoras.map((ponto) => `${ponto.hour}h`).join(" e ");
  const picoHorasShare = picoHoras
    .map((ponto) => pct((ponto.revenue / Math.max(resumo.revenue, 1)) * 100, 1))
    .join(" e ");

  const matriz = useMemo(() => {
    const grid = Array.from({ length: 7 }, () =>
      Array<number>(HORAS.length).fill(0),
    );
    for (const venda of filtradas) {
      const linha = weekdayIndex(parseDate(venda.date));
      const coluna = venda.hour - HORAS[0];
      if (coluna >= 0 && coluna < HORAS.length) {
        grid[linha][coluna] += venda.unit_price * venda.quantity;
      }
    }
    return grid;
  }, [filtradas]);

  const dadosGrafico =
    granularidade === "ano"
      ? mensal.map((ponto) => ({
          label: ponto.label.split("/")[0],
          value: ponto.revenue,
        }))
      : diario.map((ponto) => ({
          label: `${Number(ponto.date.slice(8))}`,
          value: ponto.revenue,
        }));
  const tituloGrafico =
    granularidade === "ano" ? "Receita por mês" : "Receita por dia";
  const melhorValorGrafico =
    granularidade === "ano"
      ? Math.max(...mensal.map((ponto) => ponto.revenue), 0)
      : Math.max(...diario.map((ponto) => ponto.revenue), 0);

  return (
    <main className="page">
      <PageHeader
        title="Vendas"
        description="Quando se vende e como evolui face ao ano fiscal anterior"
        range={
          granularidade === "ano"
            ? fiscalRangeLabel(janela.from, janela.to)
            : mesLabel
        }
      />

      {status === "error" && (
        <p className="notice" role="alert">
          <strong>Não foi possível ler os dados.</strong> {error}
        </p>
      )}

      <div className="filter-panel">
        <div className="filter-bar">
          <div className="filter-group">
            <fieldset className="segmented">
              <legend className="sr-only">Ano fiscal</legend>
              {(["2026", "2025"] as Ano[]).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={ano === opcao}
                  onClick={() => setAno(opcao)}
                >
                  {opcao === "2026" ? FY2026.label : FY2025.label}
                </button>
              ))}
            </fieldset>
            <fieldset className="segmented">
              <legend className="sr-only">Granularidade</legend>
              {(["ano", "mes"] as Granularidade[]).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={granularidade === opcao}
                  onClick={() => setGranularidade(opcao)}
                >
                  {opcao === "ano" ? "Ano" : "Mês"}
                </button>
              ))}
            </fieldset>
            {granularidade === "mes" && (
              <select
                className="select-pill"
                aria-label="Filtrar por mês"
                value={mesSelecionado}
                onChange={(event) => setMes(event.target.value)}
              >
                {meses.map((valor) => (
                  <option key={valor} value={valor}>
                    {monthYearLabel(`${valor}-01`)}
                  </option>
                ))}
              </select>
            )}
            <select
              className="select-pill"
              aria-label="Filtrar por pagamento"
              value={pagamento}
              onChange={(event) => setPagamento(event.target.value)}
            >
              <option value="todos">Todos os pagamentos</option>
              {metodos.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {metodo}
                </option>
              ))}
            </select>
            <select
              className="select-pill"
              aria-label="Filtrar por categoria"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
            >
              <option value="todas">Todas as categorias</option>
              {categorias.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>
          <span className="filter-count">
            {int(diasFiltrados)} dias com vendas
          </span>
        </div>
      </div>

      <div className="grid-row grid-row--four">
        <section className="panel">
          <div className="stat-top">
            <span className="stat-label">Receita do período</span>
          </div>
          <span className="stat-value">{eur(resumo.revenue)}</span>
          <span className="stat-sub">
            {eur(resumo.revenue / Math.max(diasFiltrados, 1))} por dia
          </span>
        </section>
        <section className="panel">
          <div className="stat-top">
            <span className="stat-label">Melhor dia</span>
          </div>
          <span className="stat-value">
            {melhorDia ? eur(melhorDia.revenue) : "—"}
          </span>
          <span className="stat-sub">
            {melhorDia
              ? `${Number(melhorDia.date.slice(8))} ${new Intl.DateTimeFormat("pt-PT", { month: "short" }).format(parseDate(melhorDia.date)).replace(".", "")} · ${weekdayLabel(weekdayIndex(parseDate(melhorDia.date)), false).toLowerCase()}`
              : ""}
          </span>
        </section>
        <section className="panel">
          <div className="stat-top">
            <span className="stat-label">Fim de semana</span>
          </div>
          <span className="stat-value" style={{ color: "var(--verde)" }}>
            +{pct(upliftFimDeSemana(filtradas, produtos), 1)}
          </span>
          <span className="stat-sub">por dia vs dias úteis</span>
        </section>
        <section className="panel">
          <div className="stat-top">
            <span className="stat-label">Pico horário</span>
          </div>
          <span className="stat-value">{picoHorasLabel || "—"}</span>
          <span className="stat-sub">{picoHorasShare} da receita</span>
        </section>
      </div>

      <div className="grid-row grid-row--sales">
        <section className="panel" aria-labelledby="vendas-mensal-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="vendas-mensal-titulo">
                {tituloGrafico}
              </h2>
              <p className="panel-sub">
                {granularidade === "ano"
                  ? `Ano fiscal ${ano} · ${janela.label.split(" · ")[1]} · ${int(mensal.length)} meses`
                  : `${mesLabel} · ${int(diario.length)} dias com vendas`}
              </p>
            </div>
            <div className="stat-block">
              <span className="stat-label stat-label--caps">
                {granularidade === "ano" ? "Melhor mês" : "Melhor dia"}
              </span>
              <span className="stat-value stat-value--md">
                {eur(melhorValorGrafico)}
              </span>
            </div>
          </div>
          <RevenueLine data={dadosGrafico} label={tituloGrafico} />
          <p className="panel-note">
            {granularidade === "ano"
              ? `Média mensal ${eur(resumo.revenue / Math.max(mensal.length, 1))} · pico em ${picoMesNome ?? "—"}`
              : `Média diária ${eur(resumo.revenue / Math.max(diasFiltrados, 1))} · melhor dia ${melhorDia ? Number(melhorDia.date.slice(8)) : "—"}`}
          </p>
        </section>

        <section
          className="panel panel--hero"
          aria-labelledby="comparacao-titulo"
        >
          <h2 className="sr-only" id="comparacao-titulo">
            Comparação anual
          </h2>
          <div className="panel-head">
            <span className="meta-pill">FY2026 vs FY2025</span>
          </div>

          <div className="hero-metric">
            <div
              className="hero-big"
              style={{
                color:
                  delta(
                    k26.revenue / Math.max(dias26, 1),
                    k25.revenue / Math.max(dias25, 1),
                  ) >= 0
                    ? "var(--verde)"
                    : "var(--sinopia)",
              }}
            >
              {delta(
                k26.revenue / Math.max(dias26, 1),
                k25.revenue / Math.max(dias25, 1),
              ) >= 0
                ? "+"
                : ""}
              {pct(
                delta(
                  k26.revenue / Math.max(dias26, 1),
                  k25.revenue / Math.max(dias25, 1),
                ),
              )}
            </div>
            <span className="hero-label">receita por dia</span>
            <span className="stat-value stat-value--md">
              {eur(k26.revenue / Math.max(dias26, 1))}
            </span>
            <span className="stat-sub">
              vs {eur(k25.revenue / Math.max(dias25, 1))}
            </span>
          </div>

          <div className="list-rows" style={{ marginTop: 12 }}>
            <div className="list-row">
              <span className="list-name">
                <strong>Unidades / dia</strong>
              </span>
              <span className="list-meta">
                {int(k26.units / Math.max(dias26, 1))} vs{" "}
                {int(k25.units / Math.max(dias25, 1))}
              </span>
              <span className="list-value" style={{ color: "var(--verde)" }}>
                +
                {pct(
                  delta(
                    k26.units / Math.max(dias26, 1),
                    k25.units / Math.max(dias25, 1),
                  ),
                  1,
                )}
              </span>
            </div>
            <div className="list-row">
              <span className="list-name">
                <strong>Ticket médio</strong>
              </span>
              <span className="list-meta">
                {eur(k26.avgTicket)} vs {eur(k25.avgTicket)}
              </span>
              <span className="list-value" style={{ color: "var(--sinopia)" }}>
                {pct(delta(k26.avgTicket, k25.avgTicket), 1)}
              </span>
            </div>
            <div className="list-row">
              <span className="list-name">
                <strong>Fim de semana</strong>
              </span>
              <span className="list-meta">
                +{pct(upliftFimDeSemana(fy26, produtos), 1)} vs +
                {pct(upliftFimDeSemana(fy25, produtos), 1)}
              </span>
              <span className="list-value" style={{ color: "var(--verde)" }}>
                +
                {pct(
                  delta(
                    upliftFimDeSemana(fy26, produtos),
                    upliftFimDeSemana(fy25, produtos),
                  ),
                  1,
                )}
              </span>
            </div>
          </div>
          <p className="panel-note">
            Fev–Out vs Nov–Jan: janelas sazonais diferentes.
          </p>
        </section>
      </div>

      <div className="grid-row grid-row--three">
        <section className="panel" aria-labelledby="pagamentos-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="pagamentos-titulo">
                Pagamentos
              </h2>
              <p className="panel-sub">Parte da receita · FY{ano}</p>
            </div>
          </div>
          <div className="pay-list">
            {pagamentos.map((metodo, index) => {
              const cor = ["var(--prussian)", "var(--indigo)", "var(--grid)"][
                index % 3
              ];

              return (
                <div className="pay-row" key={metodo.method}>
                  <div className="pay-top">
                    <span className="pay-name">
                      <span className="pay-dot" style={{ background: cor }} />
                      {metodo.method}
                    </span>
                    <span className="pay-share">{pct(metodo.share)}</span>
                  </div>
                  <div className="pay-track">
                    <span
                      style={{
                        width: `${Math.max(0, Math.min(100, metodo.share))}%`,
                        background: cor,
                      }}
                    />
                  </div>
                  <span className="pay-value">{eur(metodo.revenue)}</span>
                </div>
              );
            })}
          </div>
          <p className="panel-note">
            Cartão domina, mas a divisão é estável todo o ano.
          </p>
        </section>

        <section className="panel" aria-labelledby="semana-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="semana-titulo">
                Dia da semana
              </h2>
              <p className="panel-sub">Média por dia · FY{ano}</p>
            </div>
          </div>
          <ValueBars
            data={semana.map((ponto) => ({
              label: ponto.label,
              value: ponto.revenuePerDay,
            }))}
            highlight={DIAS.slice(5)}
            height={168}
            label="Receita média por dia da semana"
          />
          <p className="panel-note">
            Sábado e domingo valem +
            {pct(upliftFimDeSemana(filtradas, produtos), 1)} por dia.
          </p>
        </section>

        <section className="panel" aria-labelledby="horas-titulo">
          <div className="panel-head">
            <div className="panel-title-block">
              <h2 className="panel-title" id="horas-titulo">
                Horas mais movimentadas
              </h2>
              <p className="panel-sub">Receita por hora · FY{ano}</p>
            </div>
          </div>
          <ValueBars
            data={horas.map((ponto) => ({
              label: String(ponto.hour),
              value: ponto.revenue,
            }))}
            highlight={picoHoras.map((ponto) => String(ponto.hour))}
            narrow
            height={168}
            label="Receita por hora de funcionamento"
          />
          <p className="panel-note">
            7–9h concentram{" "}
            {pct(
              (horas
                .filter((ponto) => ponto.hour <= 9)
                .reduce((soma, ponto) => soma + ponto.revenue, 0) /
                Math.max(resumo.revenue, 1)) *
                100,
              1,
            )}{" "}
            da receita do período.
          </p>
        </section>
      </div>

      <section className="panel" aria-labelledby="heatmap-titulo">
        <div className="panel-head">
          <div className="panel-title-block">
            <h2 className="panel-title" id="heatmap-titulo">
              Quando se vende
            </h2>
            <p className="panel-sub">
              Receita por dia da semana e hora · FY{ano}
            </p>
          </div>
          <div className="heatmap-legend">
            <span>Menos</span>
            <i style={{ background: "var(--heat-0)" }} />
            <i style={{ background: "var(--heat-2)" }} />
            <i style={{ background: "var(--heat-4)" }} />
            <span>Mais</span>
          </div>
        </div>
        <Heatmap matrix={matriz} weekdays={DIAS} hours={HORAS} />
        <p className="panel-note">
          Célula mais escura = mais receita. O pico está a {picoHorasLabel},
          sobretudo ao fim de semana.
        </p>
      </section>

      <section className="panel" aria-labelledby="produtos-vendas-titulo">
        <div className="panel-head">
          <div className="panel-title-block">
            <h2 className="panel-title" id="produtos-vendas-titulo">
              Produtos
            </h2>
            <p className="panel-sub">
              Ano fiscal {ano} · {int(diasFiltrados)} dias · ordenado por lucro
              bruto
            </p>
          </div>
          <span className="meta-pill meta-pill--tint">
            {int(produtosStats.length)} produtos
          </span>
        </div>

        <div className="dtable-grid">
          {blocosProdutos.map(({ key, linhas }) => (
            <div className="dtable-wrap" key={key}>
              <table className="dtable">
                <caption className="sr-only">
                  Produtos vendidos ordenados por lucro bruto.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Produto</th>
                    <th scope="col" className="num">
                      Unid.
                    </th>
                    <th scope="col" className="num">
                      Lucro
                    </th>
                    <th scope="col" className="num">
                      Margem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((produto) => (
                    <tr key={produto.id}>
                      <th scope="row" className="cell-name">
                        <span className="article-name">
                          <ArticleIcon
                            name={produto.name}
                            category={produto.category}
                          />
                          <span>{produto.name}</span>
                        </span>
                      </th>
                      <td className="num">{int(produto.units)}</td>
                      <td className="num cell-bold">{eur(produto.profit)}</td>
                      <td
                        className="num"
                        style={{
                          color:
                            produto.margin < 70
                              ? "var(--sinopia)"
                              : "var(--indigo)",
                        }}
                      >
                        {pct(produto.margin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <p className="panel-note">
          {produtosStats
            .slice(0, 3)
            .map((produto) => produto.name)
            .join(", ")}{" "}
          concentram{" "}
          {pct(
            (produtosStats
              .slice(0, 3)
              .reduce((soma, produto) => soma + produto.profit, 0) /
              Math.max(resumo.profit, 1)) *
              100,
          )}{" "}
          do lucro.
        </p>
      </section>

      <PageFooter />
    </main>
  );
}
