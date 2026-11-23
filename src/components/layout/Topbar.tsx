"use client";

import { BellIcon } from "@solar-icons/react/linear/bell";
import { DangerCircleIcon } from "@solar-icons/react/linear/danger-circle";
import { UserRoundedIcon } from "@solar-icons/react/linear/user-rounded";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useData } from "@/hooks/useData";
import { stockDisplayStatus } from "@/lib/stock";

function countStockLevels(items: { stock: number; min_stock: number }[]) {
  const counts = { esgotado: 0, baixo: 0, ok: 0 };

  for (const item of items) {
    counts[stockDisplayStatus(item)] += 1;
  }

  return counts;
}

export function Topbar() {
  const { produtos, ingredientes } = useData();
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const menuNotificacoesRef = useRef<HTMLDivElement>(null);
  const botaoNotificacoesRef = useRef<HTMLButtonElement>(null);

  const estadoProdutos = countStockLevels(produtos);
  const estadoIngredientes = countStockLevels(ingredientes);
  const alertas =
    estadoProdutos.esgotado +
    estadoProdutos.baixo +
    estadoIngredientes.esgotado +
    estadoIngredientes.baixo;
  const notificacoes = [
    {
      id: "ingredientes-esgotados",
      count: estadoIngredientes.esgotado,
      href: "/stock",
      status: "esgotado",
      title:
        estadoIngredientes.esgotado === 1
          ? "1 artigo esgotado"
          : `${estadoIngredientes.esgotado} artigos esgotados`,
      description:
        ingredientes
          .filter((item) => stockDisplayStatus(item) === "esgotado")
          .map((item) => item.name)
          .join(", ") || "Sem artigos esgotados",
      action: "Ver stock",
    },
    {
      id: "ingredientes-baixos",
      count: estadoIngredientes.baixo,
      href: "/stock",
      status: "baixo",
      title:
        estadoIngredientes.baixo === 1
          ? "1 artigo com stock baixo"
          : `${estadoIngredientes.baixo} artigos com stock baixo`,
      description:
        ingredientes
          .filter((item) => stockDisplayStatus(item) === "baixo")
          .map((item) => item.name)
          .join(", ") || "Stock dentro do mínimo",
      action: "Ver stock",
    },
    {
      id: "produtos-esgotados",
      count: estadoProdutos.esgotado,
      href: "/produtos",
      status: "esgotado",
      title:
        estadoProdutos.esgotado === 1
          ? "1 produto esgotado"
          : `${estadoProdutos.esgotado} produtos esgotados`,
      description:
        produtos
          .filter((item) => stockDisplayStatus(item) === "esgotado")
          .map((item) => item.name)
          .join(", ") || "Sem produtos esgotados",
      action: "Ver produtos",
    },
    {
      id: "produtos-baixos",
      count: estadoProdutos.baixo,
      href: "/produtos",
      status: "baixo",
      title:
        estadoProdutos.baixo === 1
          ? "1 produto com stock baixo"
          : `${estadoProdutos.baixo} produtos com stock baixo`,
      description:
        produtos
          .filter((item) => stockDisplayStatus(item) === "baixo")
          .map((item) => item.name)
          .join(", ") || "Stock dentro do mínimo",
      action: "Ver produtos",
    },
  ].filter((notificacao) => notificacao.count > 0);

  useEffect(() => {
    if (!notificacoesAbertas) return;

    function fecharAoClicarFora(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuNotificacoesRef.current?.contains(event.target)
      ) {
        setNotificacoesAbertas(false);
      }
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificacoesAbertas(false);
        botaoNotificacoesRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [notificacoesAbertas]);

  return (
    <header className="topbar">
      <div className="topbar-actions">
        <div className="notification-menu" ref={menuNotificacoesRef}>
          <button
            ref={botaoNotificacoesRef}
            type="button"
            className="icon-btn"
            aria-label={`Notificações: ${alertas} artigos em atenção`}
            aria-expanded={notificacoesAbertas}
            aria-controls="notificacoes-popover"
            onClick={() => setNotificacoesAbertas((abertas) => !abertas)}
          >
            <BellIcon size={18} aria-hidden="true" />
            {alertas > 0 && <span className="alert-dot">{alertas}</span>}
          </button>
          <div
            id="notificacoes-popover"
            className="notification-popover"
            hidden={!notificacoesAbertas}
          >
            <div className="notification-heading">
              <p className="notification-title">Alertas de stock</p>
              {notificacoes.length > 0 && (
                <span className="notification-count">
                  {notificacoes.length} novos
                </span>
              )}
            </div>
            {notificacoes.length === 0 ? (
              <p className="notification-empty">Não existem notificações.</p>
            ) : (
              <ul className="notification-list">
                {notificacoes.map((notificacao) => (
                  <li key={notificacao.id}>
                    <Link
                      className="notification-link"
                      href={notificacao.href}
                      onClick={() => setNotificacoesAbertas(false)}
                    >
                      <span
                        className={`notification-status notification-status--${notificacao.status}`}
                      >
                        <DangerCircleIcon size={18} aria-hidden="true" />
                      </span>
                      <span className="notification-content">
                        <strong>{notificacao.title}</strong>
                        <span className="notification-description">
                          {notificacao.description}
                        </span>
                        <span className="notification-action">
                          {notificacao.action}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <Link href="/login" className="icon-btn" aria-label="Conta: André">
          <UserRoundedIcon size={18} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
