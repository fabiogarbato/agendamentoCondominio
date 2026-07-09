"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const ITENS = [
  { href: "/", label: "Início", icone: "inicio" },
  { href: "/calendario", label: "Calendário", icone: "calendario" },
  { href: "/prestadores", label: "Prestadores", icone: "prestadores" },
  { href: "/orcamentos", label: "Orçamentos", icone: "orcamentos" },
  { href: "/historico", label: "Histórico", icone: "historico" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="mx-auto flex max-w-xl">
        {ITENS.map((item) => {
          const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="group flex min-h-14 flex-col items-center justify-center gap-1"
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                    ativo
                      ? "bg-primary/12 text-primary"
                      : "text-muted group-hover:text-foreground"
                  }`}
                >
                  <Icon name={item.icone} className="size-6" />
                </span>
                <span
                  className={`text-[11px] leading-none ${
                    ativo ? "font-semibold text-primary" : "text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
