import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { StatusAcoes } from "@/components/StatusAcoes";
import { corStatus, labelCategoria, labelStatus } from "@/lib/constants";
import { diaDaSemanaLabel, formatarDataBR, isHoje } from "@/lib/date-utils";
import type { AgendamentoComPrestador } from "@/types";

const RAIL: Record<string, string> = {
  AGENDADO: "border-l-agendado",
  CONCLUIDO: "border-l-concluido",
  CANCELADO: "border-l-cancelado",
};

export function AgendamentoCard({ agendamento }: { agendamento: AgendamentoComPrestador }) {
  const hoje = isHoje(agendamento.data);

  return (
    <div
      className={`rounded-2xl border border-l-4 border-border ${RAIL[agendamento.status] ?? "border-l-border"} bg-card p-4 shadow-card transition-shadow hover:shadow-elevated`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{agendamento.prestador.nome}</p>
          <p className="text-sm text-muted">{labelCategoria(agendamento.prestador.categoria)}</p>
        </div>
        <Badge cor={corStatus(agendamento.status)}>{labelStatus(agendamento.status)}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <span className={hoje ? "font-semibold text-primary" : ""}>
          {hoje ? "Hoje" : `${diaDaSemanaLabel(agendamento.data)}, ${formatarDataBR(agendamento.data)}`}
        </span>
        <span aria-hidden="true">•</span>
        <span>{agendamento.horario}</span>
      </div>

      <p className="mt-1 text-sm text-muted">{agendamento.motivo}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href={`/agendamentos/${agendamento.id}/editar`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <Icon name="lapis" className="size-4" />
          Editar
        </Link>
        {agendamento.status === "AGENDADO" ? <StatusAcoes id={agendamento.id} /> : null}
      </div>
    </div>
  );
}
