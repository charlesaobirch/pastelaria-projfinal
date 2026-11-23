"use client";

import { BellIcon } from "@solar-icons/react/linear/bell";
import { UserRoundedIcon } from "@solar-icons/react/linear/user-rounded";
import Link from "next/link";
import { useData } from "@/hooks/useData";
import { stockDisplayStatus } from "@/lib/stock";

export function Topbar() {
  const { produtos, ingredientes } = useData();

  const alertas =
    produtos.filter((item) => stockDisplayStatus(item) !== "ok").length +
    ingredientes.filter((item) => stockDisplayStatus(item) !== "ok").length;

  return (
    <header className="topbar">
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
