import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Serviço + prestador + metadados do anexo (NUNCA o conteúdo/blob aqui: o PDF só
// é carregado na rota de download, para não trazer megabytes para as listagens).
const incluirRelacoes = {
  servico: true,
  prestador: true,
  anexo: { select: { id: true, nomeArquivo: true, tipo: true, tamanho: true } },
} satisfies Prisma.OrcamentoInclude;

/** Lista para comparação. Ordena por serviço e depois pelo mais barato; a página
 *  agrupa por serviço (a unidade de comparação). */
export function listarOrcamentos(opts: { servicoId?: number } = {}) {
  return prisma.orcamento.findMany({
    where: opts.servicoId ? { servicoId: opts.servicoId } : {},
    orderBy: [{ servico: { nome: "asc" } }, { valorCentavos: "asc" }],
    include: incluirRelacoes,
  });
}

export function obterOrcamento(id: number) {
  return prisma.orcamento.findUnique({ where: { id }, include: incluirRelacoes });
}
