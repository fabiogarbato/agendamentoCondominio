import { AgendamentoCard } from "@/components/AgendamentoCard";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { listarProximos } from "@/lib/queries/agendamentos";
import { isHoje, isProximosDias } from "@/lib/date-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Colunas do desktop escolhidas NO SERVIDOR pela quantidade de seções que de
 *  fato têm agendamento — um lg:grid-cols-3 cru com uma seção só deixaria 2/3
 *  da largura vazios, que é exatamente a queixa original.
 *  Piso MEDIDO do AgendamentoCard: 320px (61 "Editar" + 8 gap + 214 StatusAcoes
 *  + 32 do p-4 + 5 de borda). Útil = clientWidth - 240 (sidebar) - 64 (lg:px-8),
 *  limitado a 1088 (lg:max-w-6xl). Com gap-6 (24px):
 *    1024 -> 705 útil: 2 col = 340 OK | 3 col = 219 NÃO
 *    1280 -> 961 útil: 2 col = 468 OK | 3 col = 304 NÃO (abaixo do piso)
 *    1360 -> 1041 útil: 3 col = 331 OK
 *  Por isso o terceiro passo é 1360px e não xl.
 *
 *  O breakpoint arbitrário vai em REM, nunca em px: o Tailwind v4 emite as
 *  variantes arbitrárias em px ANTES das nomeadas no CSS, então
 *  `min-[1360px]:grid-cols-3` perderia para o `lg:`/`xl:` da mesma regra e
 *  NUNCA aplicaria. Em rem (85rem = 1360px) a ordem sai correta. */
const COLUNAS_SECOES: Record<number, string> = {
  1: "",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-2 min-[85rem]:grid-cols-3",
};

export default async function Home() {
  const agendamentos = await listarProximos();

  const deHoje = agendamentos.filter((a) => isHoje(a.data));
  const daSemana = agendamentos.filter((a) => !isHoje(a.data) && isProximosDias(a.data, 7));
  const futuros = agendamentos.filter((a) => !isHoje(a.data) && !isProximosDias(a.data, 7));

  const secoes = [
    { titulo: "Hoje", itens: deHoje },
    { titulo: "Esta semana", itens: daSemana },
    { titulo: "Mais adiante", itens: futuros },
  ].filter((s) => s.itens.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Agenda de Prestadores" />

      <div className="grid grid-cols-2 gap-3 lg:max-w-md">
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
        <div
          className={`grid grid-cols-1 gap-6 lg:items-start ${COLUNAS_SECOES[secoes.length] ?? ""}`}
        >
          {secoes.map((secao) => (
            <Secao
              key={secao.titulo}
              titulo={secao.titulo}
              // Com uma seção só, quem ganha colunas é a LISTA dela — senão
              // sobrariam 2/3 da largura vazios, que é a queixa original.
              listaClassName={secoes.length === 1 ? "xl:grid-cols-2 min-[85rem]:grid-cols-3" : ""}
            >
              {secao.itens.map((a) => (
                <AgendamentoCard key={a.id} agendamento={a} />
              ))}
            </Secao>
          ))}
        </div>
      )}
    </div>
  );
}

function Secao({
  titulo,
  listaClassName = "",
  children,
}: {
  titulo: string;
  listaClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{titulo}</h2>
      <div className={`grid grid-cols-1 gap-3 ${listaClassName}`}>{children}</div>
    </section>
  );
}
