import Link from "next/link";
import { AgendamentoCard } from "@/components/AgendamentoCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { listarDoMes } from "@/lib/queries/agendamentos";
import { MESES_LABEL, gradeDoMes } from "@/lib/date-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mesAdjacente(ano: number, mes: number, delta: number) {
  const total = (ano * 12 + (mes - 1)) + delta;
  const novoAno = Math.floor(total / 12);
  const novoMes = (total % 12) + 1;
  return { ano: novoAno, mes: novoMes };
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const agora = new Date();
  const ano = Number(params.ano) || agora.getFullYear();
  const mesParam = Number(params.mes);
  const mes = mesParam >= 1 && mesParam <= 12 ? mesParam : agora.getMonth() + 1;

  const agendamentos = await listarDoMes(ano, mes);
  const porDia = new Map<string, typeof agendamentos>();
  for (const a of agendamentos) {
    const lista = porDia.get(a.data) ?? [];
    lista.push(a);
    porDia.set(a.data, lista);
  }

  const semanas = gradeDoMes(ano, mes);
  const anterior = mesAdjacente(ano, mes, -1);
  const proximo = mesAdjacente(ano, mes, 1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Calendário" />

      <div className="flex items-center justify-between">
        <Link
          href={`/calendario?ano=${anterior.ano}&mes=${anterior.mes}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:text-foreground"
          aria-label="Mês anterior"
        >
          <Icon name="chevron-left" className="size-5" />
        </Link>
        <h2 className="text-base font-semibold text-foreground">
          {MESES_LABEL[mes - 1]} de {ano}
        </h2>
        <Link
          href={`/calendario?ano=${proximo.ano}&mes=${proximo.mes}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:text-foreground"
          aria-label="Próximo mês"
        >
          <Icon name="chevron-right" className="size-5" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i} className="py-2">
              {d}
            </div>
          ))}
        </div>
        {semanas.map((semana, i) => (
          <div key={i} className="grid grid-cols-7">
            {semana.map((celula) => {
              const qtd = porDia.get(celula.data)?.length ?? 0;
              return (
                <div
                  key={celula.data}
                  className={`flex aspect-square flex-col items-center justify-center border-b border-r border-border text-sm last:border-r-0 ${
                    celula.foraDoMes ? "text-muted-faint" : "text-foreground"
                  } ${celula.hoje ? "bg-primary/10 font-bold text-primary-hover" : ""}`}
                >
                  <span>{celula.dia}</span>
                  {qtd > 0 ? (
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {agendamentos.length === 0 ? (
        <EmptyState titulo="Nenhum agendamento neste mês" />
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
