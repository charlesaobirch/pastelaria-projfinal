"use client";

import { BoxIcon } from "@solar-icons/react/linear/box";
import { ChartIcon } from "@solar-icons/react/linear/chart";
import { ChefHatIcon } from "@solar-icons/react/linear/chef-hat";
import { HomeIcon } from "@solar-icons/react/linear/home";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/produtos", label: "Produtos", Icon: BoxIcon },
  { href: "/produtos#ingredientes", label: "Stocks", Icon: ChefHatIcon },
  { href: "/produtos#vendas", label: "Vendas", Icon: ChartIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="Página inicial">
        <ChefHatIcon size={20} />
      </Link>

      <nav className="side-nav" aria-label="Navegação principal">
        {ITENS.map(({ href, label, Icon }) => {
          const base = href.split("#")[0];
          const ativo = base === "/" ? pathname === "/" : pathname === base;

          return (
            <Link
              key={href}
              href={href}
              className="side-item"
              aria-current={ativo && !href.includes("#") ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="side-profile" title="Conta da pastelaria">
        A
      </div>
    </aside>
  );
}
