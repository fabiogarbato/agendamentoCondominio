import { AgendamentoCard } from "@/components/AgendamentoCard";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { listarProximos } from "@/lib/queries/agendamentos";
import { isHoje, isProximosDias } from "@/lib/date-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const agendamentos = await listarProximos();

  const deHoje = agendamentos.filter((a) => isHoje(a.data));
  const daSemana = agendamentos.filter((a) => !isHoje(a.data) && isProximosDias(a.data, 7));
  const futuros = agendamentos.filter((a) => !isHoje(a.data) && !isProximosDias(a.data, 7));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Agenda de Prestadores" />

      <div className="grid grid-cols-2 gap-3">
        <LinkButton href="/agendamentos/novo">
          <Icon name="plus" className="size-4" />
          Agendamento
        </LinkButton>
        <LinkButton href="/prestadores/novo" variant="secondary">
          <Icon name="plus" className="size-4" />
          Prestador
        </LinkButton>
      </div>

      {agendamentos.length === 0 ? (
        <EmptyState
          titulo="Nenhum agendamento por vir"
          descricao="Crie um novo agendamento para começar a organizar as visitas."
        />
      ) : (
        <>
          {deHoje.length > 0 ? (
            <Secao titulo="Hoje">
              {deHoje.map((a) => (
                <AgendamentoCard key={a.id} agendamento={a} />
              ))}
            </Secao>
          ) : null}

          {daSemana.length > 0 ? (
            <Secao titulo="Esta semana">
              {daSemana.map((a) => (
                <AgendamentoCard key={a.id} agendamento={a} />
              ))}
            </Secao>
          ) : null}

          {futuros.length > 0 ? (
            <Secao titulo="Mais adiante">
              {futuros.map((a) => (
                <AgendamentoCard key={a.id} agendamento={a} />
              ))}
            </Secao>
          ) : null}
        </>
      )}
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{titulo}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
