import { prisma } from "@/lib/prisma";
import { hojeISO, prefixoMes } from "@/lib/date-utils";

const comPrestador = { prestador: true } as const;

export function listarProximos(limite = 30) {
  return prisma.agendamento.findMany({
    where: { status: "AGENDADO", data: { gte: hojeISO() } },
    orderBy: [{ data: "asc" }, { horario: "asc" }],
    include: comPrestador,
    take: limite,
  });
}

export function listarDoMes(ano: number, mes: number) {
  const prefixo = prefixoMes(ano, mes);
  return prisma.agendamento.findMany({
    where: { data: { startsWith: prefixo } },
    orderBy: [{ data: "asc" }, { horario: "asc" }],
    include: comPrestador,
  });
}

export type FiltroHistorico = {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
};

export function listarHistorico(filtro: FiltroHistorico = {}) {
  return prisma.agendamento.findMany({
    where: {
      ...(filtro.status ? { status: filtro.status } : {}),
      ...(filtro.dataInicio || filtro.dataFim
        ? {
            data: {
              ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
              ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ data: "desc" }, { horario: "desc" }],
    include: comPrestador,
    take: 200,
  });
}

export function obterAgendamento(id: number) {
  return prisma.agendamento.findUnique({
    where: { id },
    include: comPrestador,
  });
}
