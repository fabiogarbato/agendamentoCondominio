"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITENS, navAtivo } from "@/lib/nav-itens";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {NAV_ITENS.map((item) => {
          const ativo = navAtivo(item.href, pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
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
