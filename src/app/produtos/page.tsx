"use client";

import { IngredientsTable } from "@/components/domain/IngredientsTable";
import { ProductsTable } from "@/components/domain/ProductsTable";
import { TopProducts } from "@/components/domain/TopProducts";
import { useData } from "@/hooks/useData";

export default function ProdutosPage() {
  const { produtos, ingredientes, vendas, status, error } = useData();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Produtos e ingredientes
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Catálogo, níveis de stock e vendas da pastelaria. O stock é uma
          fotografia da exportação, não um histórico de consumo.
        </p>
      </header>

      {status === "error" && (
        <div role="alert" className="notice">
          <strong className="font-semibold text-[var(--foreground)]">
            Não foi possível ler os dados.
          </strong>{" "}
          {error}
        </div>
      )}

      {status !== "ready" && status !== "error" && (
        <output className="block text-sm text-[var(--muted)]">
          A carregar dados…
        </output>
      )}

      {status === "ready" && (
        <div className="space-y-12">
          <section aria-labelledby="produtos-titulo">
            <h2
              id="produtos-titulo"
              className="mb-4 text-xl font-semibold tracking-[-0.02em]"
            >
              Produtos
            </h2>
            <ProductsTable produtos={produtos} />
          </section>

          <section aria-labelledby="ingredientes-titulo">
            <h2
              id="ingredientes-titulo"
              className="mb-4 text-xl font-semibold tracking-[-0.02em]"
            >
              Ingredientes e embalagens
            </h2>
            <IngredientsTable ingredientes={ingredientes} />
          </section>

          <section aria-labelledby="vendas-titulo">
            <h2
              id="vendas-titulo"
              className="mb-4 text-xl font-semibold tracking-[-0.02em]"
            >
              Mais vendidos e horário de pico
            </h2>
            <p className="mb-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Os períodos Dia, Mês e Ano terminam na última venda registada, não
              em hoje. As barras somam unidades por categoria em cada hora.
            </p>
            <TopProducts vendas={vendas} produtos={produtos} />
          </section>
        </div>
      )}
    </main>
  );
}
