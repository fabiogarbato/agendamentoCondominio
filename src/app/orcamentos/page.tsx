import Link from "next/link";
import { OrcamentoCard } from "@/components/OrcamentoCard";
import { OrcamentosResumo } from "@/components/OrcamentosResumo";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { formatarBRL } from "@/lib/money";
import { listarOrcamentos } from "@/lib/queries/orcamentos";
import type { OrcamentoComRelacoes } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Grupo = {
  servicoId: number;
  titulo: string;
  itens: OrcamentoComRelacoes[];
};

// Agrupa por SERVIÇO — a unidade de comparação. Só faz sentido comparar
// orçamentos do mesmo serviço; serviços diferentes (mesmo do mesmo prestador)
// ficam em blocos separados e nunca são comparados entre si.
function agrupar(orcamentos: OrcamentoComRelacoes[]): Grupo[] {
  const grupos = new Map<number, Grupo>();
  for (const o of orcamentos) {
    if (!grupos.has(o.servicoId)) {
      grupos.set(o.servicoId, { servicoId: o.servicoId, titulo: o.servico.nome, itens: [] });
    }
    grupos.get(o.servicoId)!.itens.push(o);
  }
  return [...grupos.values()].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR"),
  );
}

export default async function OrcamentosPage() {
  const orcamentos = await listarOrcamentos();
  const grupos = agrupar(orcamentos);

  // Total aprovado = soma dos orçamentos ACEITOS (o que já está comprometido).
  const aceitos = orcamentos.filter((o) => o.status === "ACEITO");
  const totalAprovadoCentavos = aceitos.reduce((s, o) => s + o.valorCentavos, 0);
  const qtdPendentes = orcamentos.filter((o) => o.status === "PENDENTE").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orçamentos" />

      {orcamentos.length > 0 ? (
        <OrcamentosResumo
          totalAprovadoCentavos={totalAprovadoCentavos}
          qtdAceitos={aceitos.length}
          qtdPendentes={qtdPendentes}
        />
      ) : null}

      <LinkButton href="/orcamentos/novo" className="lg:self-start">
        <Icon name="plus" className="size-4" />
        Novo orçamento
      </LinkButton>

      {orcamentos.length === 0 ? (
        <EmptyState
          icone="orcamentos"
          titulo="Nenhum orçamento ainda"
          descricao="Cadastre os preços que os prestadores passaram e compare por serviço para achar o mais barato."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {grupos.map((grupo) => {
            // RECUSADO não entra no ranking; itens já vêm ordenados por preço asc.
            const candidatos = grupo.itens.filter((o) => o.status !== "RECUSADO");
            const recusados = grupo.itens.filter((o) => o.status === "RECUSADO");
            const ordenados = [...candidatos, ...recusados];
            const menor = candidatos[0]?.valorCentavos;
            const maior = candidatos[candidatos.length - 1]?.valorCentavos;
            const idMaisBarato = candidatos[0]?.id;
            const qtd = grupo.itens.length;
            // Rótulo do link de adicionar: precisa fazer sentido com 0, 1 e N
            // candidatos — "Adicionar outro para comparar" só cabe quando há 1.
            const rotuloAdicionar =
              candidatos.length === 0
                ? "Adicionar um orçamento deste serviço"
                : candidatos.length === 1
                  ? "Adicionar outro para comparar"
                  : "Adicionar mais um para comparar";

            return (
              <section key={grupo.servicoId} className="flex flex-col gap-3">
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <h2 className="text-base font-bold tracking-tight text-foreground">
                      {grupo.titulo}
                    </h2>
                    <span className="shrink-0 text-xs font-medium text-muted">
                      {qtd} {qtd === 1 ? "orçamento" : "orçamentos"}
                    </span>
                  </div>
                  {candidatos.length >= 2 && menor != null && maior != null ? (
                    <p className="mt-1 text-xs text-muted">
                      Menor{" "}
                      <b className="font-semibold tabular-nums text-foreground">
                        {formatarBRL(menor)}
                      </b>
                      <span className="mx-1.5 text-muted-faint">·</span>
                      Maior <span className="tabular-nums">{formatarBRL(maior)}</span>
                      <span className="mx-1.5 text-muted-faint">·</span>
                      economia de até{" "}
                      <b className="font-semibold tabular-nums text-concluido-fg">
                        {formatarBRL(maior - menor)}
                      </b>
                    </p>
                  ) : null}
                </div>

                {/* 2 colunas só a partir de xl (1280): o rodapé do card pode ter
                    até 5 ações (com PDF anexado) e mede 451px de largura natural.
                    Em 1024 a coluna daria 313px úteis e o rodapé quebraria em 5
                    de 8 cards. 3 colunas nunca cabem — saturariam em 355px. */}
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {ordenados.map((o) => (
                    <OrcamentoCard
                      key={o.id}
                      orcamento={o}
                      maisBarato={o.id === idMaisBarato && o.status !== "RECUSADO"}
                      menorCentavos={menor}
                      totalCandidatos={candidatos.length}
                    />
                  ))}
                </div>

                {/* Não existe limite de orçamentos por serviço: listarOrcamentos
                    (src/lib/queries/orcamentos.ts) não tem take nem corte, o
                    POST /api/orcamentos não valida quantidade e o ordenados.map
                    acima renderiza todos. O que dava a falsa impressão de teto
                    era ESTE link sumir ao chegar em 2 candidatos. Agora ele fica
                    sempre visível. */}
                <Link
                  href={`/orcamentos/novo?servico=${encodeURIComponent(grupo.titulo)}`}
                  className="inline-flex items-center gap-1.5 px-1 text-xs font-medium text-primary"
                >
                  <Icon name="plus" className="size-3.5" />
                  {rotuloAdicionar}
                </Link>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
