/** Itens de navegação compartilhados pela NavBar (mobile, barra inferior) e
 *  pela SideNav (desktop, lateral). Fonte ÚNICA: item novo aqui nasce nas duas
 *  navs. Duplicar a lista faria um item aparecer só em uma delas. */
export const NAV_ITENS = [
  { href: "/", label: "Início", icone: "inicio" },
  { href: "/calendario", label: "Calendário", icone: "calendario" },
  { href: "/prestadores", label: "Prestadores", icone: "prestadores" },
  { href: "/orcamentos", label: "Orçamentos", icone: "orcamentos" },
  { href: "/historico", label: "Histórico", icone: "historico" },
] as const;

export type NavItem = (typeof NAV_ITENS)[number];

/** Regra de item ativo — a mesma que estava inline na NavBar (linha 22):
 *  "/" só casa exato (por prefixo ficaria aceso em toda rota); os demais casam
 *  por prefixo para manter o item aceso nas subrotas (/prestadores/novo mantém
 *  "Prestadores" ativo). Mora aqui pelo mesmo motivo da lista: se as duas navs
 *  tiverem cópias da regra, elas divergem. */
export function navAtivo(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
