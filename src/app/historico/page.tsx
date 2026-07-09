import { AgendamentoCard } from "@/components/AgendamentoCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { STATUS_AGENDAMENTO } from "@/lib/constants";
import { listarHistorico } from "@/lib/queries/agendamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAMPO =
  "min-h-11 rounded-xl border border-border-strong bg-card px-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dataInicio?: string; dataFim?: string }>;
}) {
  const params = await searchParams;
  const agendamentos = await listarHistorico({
    status: params.status || undefined,
    dataInicio: params.dataInicio || undefined,
    dataFim: params.dataFim || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Histórico" />

      <form
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        method="get"
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">De</span>
            <input type="date" name="dataInicio" defaultValue={params.dataInicio ?? ""} className={CAMPO} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Até</span>
            <input type="date" name="dataFim" defaultValue={params.dataFim ?? ""} className={CAMPO} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Status</span>
          <div className="relative">
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className={`${CAMPO} w-full appearance-none pr-9`}
            >
              <option value="">Todos</option>
              {STATUS_AGENDAMENTO.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
              <Icon name="chevron-down" className="size-4" />
            </span>
          </div>
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-hover"
        >
          Filtrar
        </button>
      </form>

      {agendamentos.length === 0 ? (
        <EmptyState
          icone="historico"
          titulo="Nenhum agendamento encontrado"
          descricao="Ajuste os filtros acima."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {agendamentos.map((a) => (
            <AgendamentoCard key={a.id} agendamento={a} />
          ))}
        </div>
      )}
    </div>
  );
}
