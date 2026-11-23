"use client";

import { BoxIcon } from "@solar-icons/react/linear/box";
import { BoxMinimalisticIcon } from "@solar-icons/react/linear/box-minimalistic";
import { ChartIcon } from "@solar-icons/react/linear/chart";
import { Grid2x2Icon } from "@solar-icons/react/linear/grid-2x2";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", label: "Visão geral", Icon: Grid2x2Icon },
  { href: "/vendas", label: "Vendas", Icon: ChartIcon },
  { href: "/produtos", label: "Produtos", Icon: BoxIcon },
  { href: "/stock", label: "Stock", Icon: BoxMinimalisticIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="Balcão da Praça">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-glyph" />
        </span>
        <span className="brand-word">Balcão da Praça</span>
      </Link>

      <nav className="side-nav" aria-label="Navegação principal">
        {ITENS.map(({ href, label, Icon }) => {
          const ativo = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className="side-item"
              aria-current={ativo ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="side-data">
        <span className="side-data-label">Dados</span>
        <span className="side-data-value">Nov 2025 – Out 2026</span>
      </div>
    </aside>
  );
}
