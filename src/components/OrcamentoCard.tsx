import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { OrcamentoStatusAcoes } from "@/components/OrcamentoStatusAcoes";
import { ExcluirOrcamentoBotao } from "@/components/ExcluirOrcamentoBotao";
import { corStatusOrcamento, labelStatusOrcamento } from "@/lib/constants";
import { formatarBRL } from "@/lib/money";
import { formatarDataBR } from "@/lib/date-utils";
import type { OrcamentoComRelacoes } from "@/types";

export function OrcamentoCard({
  orcamento,
  maisBarato = false,
  menorCentavos,
  totalCandidatos = 0,
}: {
  orcamento: OrcamentoComRelacoes;
  maisBarato?: boolean;
  menorCentavos?: number;
  totalCandidatos?: number;
}) {
  const recusado = orcamento.status === "RECUSADO";
  const temComparacao = totalCandidatos >= 2;
  const mostrarDiferenca =
    !maisBarato &&
    !recusado &&
    menorCentavos != null &&
    menorCentavos > 0 &&
    orcamento.valorCentavos > menorCentavos;

  return (
    <div
      className={`rounded-2xl border bg-card p-4 shadow-card transition-shadow hover:shadow-elevated ${
        maisBarato && temComparacao
          ? "border-l-4 border-l-concluido border-border ring-1 ring-concluido/30"
          : "border-border"
      } ${recusado ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{orcamento.prestador.nome}</p>
          {orcamento.descricao ? (
            <p className="truncate text-sm text-muted">{orcamento.descricao}</p>
          ) : null}
        </div>
        <Badge cor={corStatusOrcamento(orcamento.status)}>
          {labelStatusOrcamento(orcamento.status)}
        </Badge>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {formatarBRL(orcamento.valorCentavos)}
          </p>
          {mostrarDiferenca ? (
            <p className="mt-0.5 text-xs text-muted">
              <span className="font-semibold tabular-nums text-foreground">
                +{formatarBRL(orcamento.valorCentavos - menorCentavos!)}
              </span>{" "}
              (+{Math.round(((orcamento.valorCentavos - menorCentavos!) / menorCentavos!) * 100)}%) acima do menor
            </p>
          ) : null}
        </div>
        {maisBarato && temComparacao ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-concluido-bg px-2.5 py-1 text-xs font-semibold text-concluido-fg">
            <Icon name="check" className="size-3.5" />
            Mais barato
          </span>
        ) : null}
      </div>

      {orcamento.validadeAte ? (
        <p className="mt-3 text-sm text-muted tabular-nums">
          Válido até {formatarDataBR(orcamento.validadeAte)}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {orcamento.anexo ? (
          <a
            href={`/api/orcamentos/${orcamento.id}/anexo`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Icon name="orcamentos" className="size-4" />
            Ver PDF
          </a>
        ) : null}
        <Link
          href={`/orcamentos/${orcamento.id}/editar`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <Icon name="lapis" className="size-4" />
          Editar
        </Link>
        {orcamento.status === "PENDENTE" ? <OrcamentoStatusAcoes id={orcamento.id} /> : null}
        <ExcluirOrcamentoBotao id={orcamento.id} />
      </div>
    </div>
  );
}
