"use client";

import {
  Boxes,
  ChartNoAxesCombined,
  Croissant,
  LayoutGrid,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/visao-geral", label: "Visão geral", Icon: LayoutGrid },
  { href: "/vendas", label: "Vendas", Icon: ChartNoAxesCombined },
  { href: "/produtos", label: "Produtos", Icon: Package },
  { href: "/stock", label: "Stock", Icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/visao-geral" className="brand" aria-label="Balcão da Praça">
        <span className="brand-mark" aria-hidden="true">
          <Croissant size={17} />
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
    </aside>
  );
}
