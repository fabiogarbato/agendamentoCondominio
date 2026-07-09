import { prisma } from "@/lib/prisma";

const comPrestador = { prestador: true } as const;

/** Lista para comparação. Filtro opcional por categoria (via relação).
 *  Ordena por categoria e depois pelo mais barato; a página só agrupa. */
export function listarOrcamentos(opts: { categoria?: string } = {}) {
  return prisma.orcamento.findMany({
    where: opts.categoria ? { prestador: { categoria: opts.categoria } } : {},
    orderBy: [{ prestador: { categoria: "asc" } }, { valorCentavos: "asc" }],
    include: comPrestador,
  });
}

export function obterOrcamento(id: number) {
  return prisma.orcamento.findUnique({ where: { id }, include: comPrestador });
}
