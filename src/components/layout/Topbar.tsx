"use client";

import { BellIcon } from "@solar-icons/react/linear/bell";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
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
        <MagnifierIcon size={16} aria-hidden="true" />
        <label className="sr-only" htmlFor="pesquisa-global">
          Pesquisar produtos e ingredientes
        </label>
        <input
          id="pesquisa-global"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar produtos e ingredientes…"
        />
      </div>

      <div className="topbar-actions">
        <Link
          href="/produtos#produtos"
          className="icon-btn"
          aria-label={`${alertas} artigos com stock em atenção`}
        >
          <BellIcon size={17} aria-hidden="true" />
          {alertas > 0 && <span className="alert-dot">{alertas}</span>}
        </Link>
        <div className="avatar" role="img" aria-label="Conta: André">
          A
        </div>
      </div>
    </header>
  );
}
