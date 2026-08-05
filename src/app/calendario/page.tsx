import Link from "next/link";
import { AgendamentoCard } from "@/components/AgendamentoCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { listarDoMes } from "@/lib/queries/agendamentos";
import { MESES_LABEL, gradeDoMes } from "@/lib/date-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Máximo de chips por dia dentro da célula no desktop.
 *  INVARIANTE MEDIDO: a altura natural da célula é 29px (só o número do dia) +
 *  18px por linha de chip. Com 3 chips + a linha "+N mais" dá 103px, que cabe
 *  nos 112px do lg:min-h-28 da célula — é ISSO que mantém todas as semanas com
 *  a mesma altura, mesmo a grade sendo um grid POR SEMANA.
 *  Se subir para 4, a altura natural vai a 121px e é OBRIGATÓRIO trocar a
 *  célula para lg:min-h-32 (128px), senão as semanas ficam desiguais. */
const CHIPS_POR_DIA = 3;

const CHIP_STATUS: Record<string, string> = {
  AGENDADO: "bg-agendado-bg text-agendado-fg",
  CONCLUIDO: "bg-concluido-bg text-concluido-fg",
  CANCELADO: "bg-cancelado-bg text-cancelado-fg line-through",
};

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
              const lista = porDia.get(celula.data) ?? [];
              return (
                <div
                  key={celula.data}
                  className={`flex aspect-square flex-col items-center justify-center border-b border-r border-border text-sm last:border-r-0 lg:aspect-auto lg:min-h-28 lg:min-w-0 lg:items-stretch lg:justify-start lg:gap-1 lg:p-1.5 ${
                    celula.foraDoMes ? "text-muted-faint" : "text-foreground"
                  } ${celula.hoje ? "bg-primary/10 font-bold text-primary-hover" : ""}`}
                >
                  <span className="lg:text-xs">{celula.dia}</span>
                  {lista.length > 0 ? (
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary lg:hidden" />
                  ) : null}
                  {lista.length > 0 ? (
                    <ul className="hidden min-w-0 lg:flex lg:flex-col lg:gap-0.5">
                      {lista.slice(0, CHIPS_POR_DIA).map((a) => (
                        <li key={a.id} className="min-w-0">
                          <Link
                            href={`/agendamentos/${a.id}/editar`}
                            title={`${a.horario} — ${a.prestador.nome}: ${a.motivo}`}
                            className={`block truncate rounded px-1.5 text-[11px] font-medium leading-4 ${CHIP_STATUS[a.status] ?? ""}`}
                          >
                            {a.horario} {a.prestador.nome}
                          </Link>
                        </li>
                      ))}
                      {lista.length > CHIPS_POR_DIA ? (
                        <li className="truncate px-1.5 text-[11px] font-normal leading-4 text-muted">
                          +{lista.length - CHIPS_POR_DIA} mais
                        </li>
                      ) : null}
                    </ul>
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
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {/* A lista NÃO some no desktop: o chip da célula é só relance, não tem
              Concluir/Cancelar (StatusAcoes só existe dentro do AgendamentoCard),
              então escondê-la tiraria as únicas ações da tela. */}
          <h2 className="hidden text-xs font-semibold uppercase tracking-[0.08em] text-muted lg:block xl:col-span-full">
            Todos os agendamentos do mês
          </h2>
          {agendamentos.map((a) => (
            <AgendamentoCard key={a.id} agendamento={a} />
          ))}
        </div>
      )}
    </div>
  );
}
