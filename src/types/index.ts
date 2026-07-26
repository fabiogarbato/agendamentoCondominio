import type { Agendamento, Orcamento, Prestador, Servico } from "@prisma/client";

export type { Agendamento, Orcamento, Prestador, Servico };

export type AgendamentoComPrestador = Agendamento & { prestador: Prestador };

/** Metadados do anexo SEM o conteúdo (blob) — o suficiente para exibir o link
 *  "ver PDF" sem carregar megabytes em memória nas listagens. */
export type AnexoMeta = {
  id: number;
  nomeArquivo: string;
  tipo: string;
  tamanho: number;
};

/** Orçamento com tudo que a tela de comparação precisa: o serviço (unidade de
 *  comparação), o prestador e o anexo (só metadados). */
export type OrcamentoComRelacoes = Orcamento & {
  servico: Servico;
  prestador: Prestador;
  anexo: AnexoMeta | null;
};

// Alias mantido para não quebrar imports antigos; hoje carrega serviço + anexo.
export type OrcamentoComPrestador = OrcamentoComRelacoes;

export type PrestadorComContagem = Prestador & {
  _count: { agendamentos: number; orcamentos: number };
};

export type ServicoComContagem = Servico & {
  _count: { orcamentos: number };
};
