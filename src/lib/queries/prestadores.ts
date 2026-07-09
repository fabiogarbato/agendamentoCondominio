import { prisma } from "@/lib/prisma";

export function listarPrestadores(opts: { ativo?: boolean } = {}) {
  return prisma.prestador.findMany({
    where: opts.ativo === undefined ? {} : { ativo: opts.ativo },
    orderBy: { nome: "asc" },
    include: { _count: { select: { agendamentos: true, orcamentos: true } } },
  });
}

export function obterPrestador(id: number) {
  return prisma.prestador.findUnique({
    where: { id },
    include: { _count: { select: { agendamentos: true, orcamentos: true } } },
  });
}
