"use client";

import { BellIcon } from "@solar-icons/react/linear/bell";
import { UserRoundedIcon } from "@solar-icons/react/linear/user-rounded";
import Link from "next/link";
import { useData } from "@/hooks/useData";
import { stockDisplayStatus } from "@/lib/stock";
import { useSearch } from "@/store/useSearch";

export function Topbar() {
  const query = useSearch((state) => state.query);
  const setQuery = useSearch((state) => state.setQuery);
  const { produtos, ingredientes } = useData();

  const alertas =
    produtos.filter((item) => stockDisplayStatus(item) !== "ok").length +
    ingredientes.filter((item) => stockDisplayStatus(item) !== "ok").length;

  return (
    <header className="topbar">
      <div className="search-box">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label className="sr-only" htmlFor="pesquisa-global">
          Pesquisar vendas, produtos ou stock
        </label>
        <input
          id="pesquisa-global"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar vendas, produtos ou stock…"
        />
      </div>

      <div className="topbar-actions">
        <Link
          href="/stock"
          className="icon-btn"
          aria-label={`${alertas} artigos com stock em atenção`}
        >
          <BellIcon size={18} aria-hidden="true" />
          {alertas > 0 && <span className="alert-dot">{alertas}</span>}
        </Link>
        <Link href="/login" className="icon-btn" aria-label="Conta: André">
          <UserRoundedIcon size={18} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
