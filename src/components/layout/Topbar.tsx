"use client";

import { BellIcon } from "@solar-icons/react/linear/bell";
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

function notificationMessage(
  count: number,
  singular: string,
  plural: string,
  status: "esgotado" | "baixo",
) {
  const verb = count === 1 ? "Existe um" : `Existem ${count}`;
  const noun = count === 1 ? singular : plural;
  const ending =
    status === "esgotado"
      ? count === 1
        ? "esgotado."
        : "esgotados."
      : "com o stock baixo.";

  return `${verb} ${noun} ${ending}`;
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
      message: notificationMessage(
        estadoIngredientes.esgotado,
        "artigo",
        "artigos",
        "esgotado",
      ),
    },
    {
      id: "ingredientes-baixos",
      count: estadoIngredientes.baixo,
      href: "/stock",
      message: notificationMessage(
        estadoIngredientes.baixo,
        "artigo",
        "artigos",
        "baixo",
      ),
    },
    {
      id: "produtos-esgotados",
      count: estadoProdutos.esgotado,
      href: "/produtos",
      message: notificationMessage(
        estadoProdutos.esgotado,
        "produto",
        "produtos",
        "esgotado",
      ),
    },
    {
      id: "produtos-baixos",
      count: estadoProdutos.baixo,
      href: "/produtos",
      message: notificationMessage(
        estadoProdutos.baixo,
        "produto",
        "produtos",
        "baixo",
      ),
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
            <p className="notification-title">Notificações</p>
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
                      {notificacao.message}
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
