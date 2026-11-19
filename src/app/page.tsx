"use client";

/**
 * Página de fumo da fase 0 — não é o ecrã final.
 *
 * Serve para provar, no browser, que a cadeia inteira funciona com os dados
 * reais: JSON em `public/data` → `services` → store → `lib` → ecrã. O layout
 * definitivo ainda não foi decidido.
 */

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { useKpis } from "@/hooks/useKpis";
import { useProductStats } from "@/hooks/useProductStats";
import { dataRange } from "@/lib/dates";
import { eur, int, pct } from "@/lib/format";
import { stockAlerts, stockByLevel } from "@/lib/stock";

export default function Page() {
  const { vendas, ingredientes, status, error } = useData();
  const { kpis } = useKpis();
  const { stats } = useProductStats();

  const periodo = useMemo(() => {
    const range = dataRange(vendas.map((venda) => venda.date));
    const dias = new Set(vendas.map((venda) => venda.date)).size;
    return { ...range, dias };
  }, [vendas]);

  const alertas = useMemo(() => stockAlerts(ingredientes), [ingredientes]);
  const niveis = useMemo(() => stockByLevel(ingredientes), [ingredientes]);

  const cards = [
    {
      label: "Receita",
      value: eur(kpis.revenue),
      note: `${int(kpis.lines)} linhas de venda`,
    },
    {
      label: "Lucro",
      value: eur(kpis.profit),
      note: `custo ${eur(kpis.cost)}`,
    },
    { label: "Margem", value: pct(kpis.margin), note: "lucro sobre receita" },
    {
      label: "Unidades",
      value: int(kpis.units),
      note: `ticket médio ${eur(kpis.avgTicket)}`,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Fase 0 · verificação
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Pastelaria</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          JSON → services → store → lib → ecrã. Sem layout definitivo: esta
          página só confirma que a cadeia devolve os números do relatório.
        </p>
      </header>

      {status === "error" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <strong className="font-semibold">Falhou a leitura dos dados.</strong>{" "}
          {error}
        </div>
      )}

      {status !== "ready" && status !== "error" && (
        <p className="text-sm text-neutral-500">A carregar dados…</p>
      )}

      {status === "ready" && (
        <>
          <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
            {periodo.from} → {periodo.to} · {int(periodo.dias)} dias com vendas
            · {int(kpis.lines)} linhas
          </p>

          <section
            aria-label="Indicadores"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{card.note}</p>
              </div>
            ))}
          </section>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section aria-label="Top 5 por lucro">
              <h2 className="mb-3 text-sm font-semibold">Top 5 por lucro</h2>
              <ol className="divide-y divide-black/10 rounded-xl border border-black/10 dark:divide-white/10 dark:border-white/15">
                {stats.slice(0, 5).map((produto) => (
                  <li
                    key={produto.id}
                    className="flex items-baseline justify-between gap-4 p-3"
                  >
                    <span className="text-sm">
                      {produto.name}
                      <span className="ml-2 text-xs text-neutral-500">
                        {int(produto.units)} un
                      </span>
                    </span>
                    <span className="text-sm tabular-nums">
                      {eur(produto.profit)}
                      <span className="ml-2 text-xs text-neutral-500">
                        {pct(produto.profitShare)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-label="Alertas de stock">
              <h2 className="mb-3 text-sm font-semibold">
                Stock abaixo do mínimo
              </h2>
              <div className="rounded-xl border border-black/10 p-3 dark:border-white/15">
                <p className="mb-2 text-xs text-neutral-500">
                  {niveis.esgotado} esgotado · {niveis.baixo} baixo ·{" "}
                  {niveis.ok} ok
                </p>
                <ul className="space-y-1">
                  {alertas.map((alerta) => (
                    <li key={alerta.id} className="text-sm">
                      {alerta.name}
                      <span className="ml-2 text-xs text-neutral-500">
                        faltam {int(alerta.missing)} {alerta.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
