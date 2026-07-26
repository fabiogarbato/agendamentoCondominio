import { Icon } from "@/components/ui/Icon";
import { formatarBRL } from "@/lib/money";

/** Resumo no topo da tela de orçamentos: quanto já foi aprovado (soma dos
 *  orçamentos ACEITOS) — ou seja, quanto o usuário vai gastar até o momento. */
export function OrcamentosResumo({
  totalAprovadoCentavos,
  qtdAceitos,
  qtdPendentes,
}: {
  totalAprovadoCentavos: number;
  qtdAceitos: number;
  qtdPendentes: number;
}) {
  return (
    <div className="rounded-2xl border border-concluido/30 bg-concluido-bg/40 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-concluido-fg">
            Total aprovado
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatarBRL(totalAprovadoCentavos)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {qtdAceitos > 0 ? (
              <>
                {qtdAceitos} {qtdAceitos === 1 ? "orçamento aceito" : "orçamentos aceitos"}{" "}
                · o quanto você vai gastar até agora
              </>
            ) : (
              "Nenhum orçamento aceito ainda"
            )}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-concluido-bg text-concluido-fg">
          <Icon name="check" className="size-5" />
        </span>
      </div>

      {qtdPendentes > 0 ? (
        <p className="mt-3 border-t border-concluido/20 pt-3 text-xs text-muted">
          {qtdPendentes}{" "}
          {qtdPendentes === 1 ? "orçamento pendente" : "orçamentos pendentes"} aguardando
          decisão
        </p>
      ) : null}
    </div>
  );
}
