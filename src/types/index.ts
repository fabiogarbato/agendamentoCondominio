import type { Agendamento, Orcamento, Prestador } from "@prisma/client";

export type { Agendamento, Orcamento, Prestador };

export type AgendamentoComPrestador = Agendamento & { prestador: Prestador };

export type OrcamentoComPrestador = Orcamento & { prestador: Prestador };

export type PrestadorComContagem = Prestador & {
  _count: { agendamentos: number; orcamentos: number };
};
