export const CATEGORIAS_PRESTADOR = [
  { value: "ELETRICISTA", label: "Eletricista" },
  { value: "ENCANADOR", label: "Encanador" },
  { value: "FAXINEIRA", label: "Faxineira / Diarista" },
  { value: "AR_CONDICIONADO", label: "Técnico de ar-condicionado" },
  { value: "ENTREGADOR", label: "Entregador" },
  { value: "CHAVEIRO", label: "Chaveiro" },
  { value: "PINTOR", label: "Pintor" },
  { value: "MARCENEIRO", label: "Marceneiro / Montador de móveis" },
  { value: "JARDINEIRO", label: "Jardineiro" },
  { value: "DEDETIZADOR", label: "Dedetizador" },
  { value: "OUTRO", label: "Outro" },
] as const;

export type CategoriaPrestador = (typeof CATEGORIAS_PRESTADOR)[number]["value"];

export const CATEGORIA_VALUES = CATEGORIAS_PRESTADOR.map((c) => c.value) as [
  string,
  ...string[],
];

export function labelCategoria(value: string): string {
  return (
    CATEGORIAS_PRESTADOR.find((c) => c.value === value)?.label ?? value
  );
}

export const STATUS_AGENDAMENTO = [
  { value: "AGENDADO", label: "Agendado", cor: "azul" },
  { value: "CONCLUIDO", label: "Concluído", cor: "verde" },
  { value: "CANCELADO", label: "Cancelado", cor: "cinza" },
] as const;

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number]["value"];

export const STATUS_VALUES = STATUS_AGENDAMENTO.map((s) => s.value) as [
  string,
  ...string[],
];

export function labelStatus(value: string): string {
  return STATUS_AGENDAMENTO.find((s) => s.value === value)?.label ?? value;
}

export function corStatus(value: string): "azul" | "verde" | "cinza" {
  return (
    STATUS_AGENDAMENTO.find((s) => s.value === value)?.cor ?? "cinza"
  );
}

export const STATUS_ORCAMENTO = [
  { value: "PENDENTE", label: "Pendente", cor: "azul" },
  { value: "ACEITO", label: "Aceito", cor: "verde" },
  { value: "RECUSADO", label: "Recusado", cor: "cinza" },
] as const;

export type StatusOrcamento = (typeof STATUS_ORCAMENTO)[number]["value"];

export const STATUS_ORCAMENTO_VALUES = STATUS_ORCAMENTO.map((s) => s.value) as [
  string,
  ...string[],
];

export function labelStatusOrcamento(value: string): string {
  return STATUS_ORCAMENTO.find((s) => s.value === value)?.label ?? value;
}

export function corStatusOrcamento(value: string): "azul" | "verde" | "cinza" {
  return STATUS_ORCAMENTO.find((s) => s.value === value)?.cor ?? "cinza";
}
