import Link from "next/link";
import { OrcamentoCard } from "@/components/OrcamentoCard";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIAS_PRESTADOR, labelCategoria } from "@/lib/constants";
import { formatarBRL } from "@/lib/money";
import { listarOrcamentos } from "@/lib/queries/orcamentos";
import type { OrcamentoComPrestador } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Grupo = {
  chave: string;
  categoria: string;
  titulo: string;
  itens: OrcamentoComPrestador[];
};

const ordemCategoria = new Map<string, number>(
  CATEGORIAS_PRESTADOR.map((c, i) => [c.value, i]),
);

// Agrupa por categoria; "OUTRO" é subdividido por categoriaOutro para não misturar
// serviços diferentes (ex.: piscineiro vs. guincho) no mesmo balde de comparação.
function agrupar(orcamentos: OrcamentoComPrestador[]): Grupo[] {
  const grupos = new Map<string, Grupo>();
  for (const o of orcamentos) {
    const cat = o.prestador.categoria;
    const sub =
      cat === "OUTRO" ? (o.prestador.categoriaOutro?.trim() || "Outro") : "";
    const chave = cat === "OUTRO" ? `OUTRO::${sub.toLowerCase()}` : cat;
    const titulo = cat === "OUTRO" ? sub : labelCategoria(cat);
    if (!grupos.has(chave)) {
      grupos.set(chave, { chave, categoria: cat, titulo, itens: [] });
    }
    grupos.get(chave)!.itens.push(o);
  }
  return [...grupos.values()].sort((a, b) => {
    const oa = ordemCategoria.get(a.categoria) ?? 999;
    const ob = ordemCategoria.get(b.categoria) ?? 999;
    return oa !== ob ? oa - ob : a.titulo.localeCompare(b.titulo, "pt-BR");
  });
}

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  await searchParams;
  const orcamentos = await listarOrcamentos();
  const grupos = agrupar(orcamentos);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orçamentos" />

      <LinkButton href="/orcamentos/novo">
        <Icon name="plus" className="size-4" />
        Novo orçamento
      </LinkButton>

      {orcamentos.length === 0 ? (
        <EmptyState
          icone="orcamentos"
          titulo="Nenhum orçamento ainda"
          descricao="Cadastre os preços que os prestadores passaram e compare por categoria para achar o mais barato."
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

            return (
              <section key={grupo.chave} className="flex flex-col gap-3">
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

                <div className="flex flex-col gap-3">
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

                {candidatos.length < 2 ? (
                  <Link
                    href={`/orcamentos/novo?categoria=${grupo.categoria}`}
                    className="inline-flex items-center gap-1.5 px-1 text-xs font-medium text-primary"
                  >
                    <Icon name="plus" className="size-3.5" />
                    Adicionar outro para comparar
                  </Link>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
