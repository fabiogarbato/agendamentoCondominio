"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITENS, navAtivo } from "@/lib/nav-itens";

/**
 * Navegação lateral do desktop (>= lg / 1024px).
 *
 * Abaixo de lg a raiz é `hidden` (display:none, nenhuma caixa gerada) e quem
 * navega é a NavBar inferior — por isso SÓ a raiz leva prefixo lg:. Os filhos
 * ficam sem prefixo de propósito: com a raiz em display:none eles nunca geram
 * layout no mobile, então prefixar tudo seria ruído sem efeito.
 *
 * É <nav> e não <aside>: no desktop a NavBar inferior fica display:none, então
 * este é o ÚNICO landmark de navegação da página — <aside> seria "complementary"
 * e o leitor de tela perderia o atalho para a navegação principal.
 *
 * Itens (NAV_ITENS) e regra de ativo (navAtivo) são os mesmos da NavBar.
 *
 * A largura é em PX (lg:w-[240px]) e não em rem (w-60 = 15rem) de propósito: a
 * decisão de colunas do conteúdo é media query, e media query em rem usa a fonte
 * INICIAL, não a do root. Com a fonte do navegador em "Grande" uma sidebar em
 * rem cresceria para 300px sem que as colunas recuassem, e o conteúdo estouraria.
 */
export function SideNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação lateral"
      className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[240px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-border lg:bg-card/60 lg:px-3 lg:py-6"
    >
      <span className="px-3 pb-6 text-sm font-bold tracking-tight text-foreground">
        Agenda de Prestadores
      </span>

      <ul className="flex flex-col gap-1">
        {NAV_ITENS.map((item) => {
          const ativo = navAtivo(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                  ativo
                    ? "bg-primary/12 font-semibold text-primary"
                    : "text-muted hover:bg-border/40 hover:text-foreground"
                }`}
              >
                <Icon name={item.icone} className="size-6 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Rodapé: toggle de tema global (o do PageHeader some no desktop). */}
      <div className="mt-auto px-3 pt-6">
        <ThemeToggle />
      </div>
    </nav>
  );
}
