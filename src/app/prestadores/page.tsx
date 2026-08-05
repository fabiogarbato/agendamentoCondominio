import { PrestadorCard } from "@/components/PrestadorCard";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { listarPrestadores } from "@/lib/queries/prestadores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PrestadoresPage() {
  const prestadores = await listarPrestadores();
  const ativos = prestadores.filter((p) => p.ativo);
  const inativos = prestadores.filter((p) => !p.ativo);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Prestadores" />

      <LinkButton href="/prestadores/novo" className="lg:self-start">
        <Icon name="plus" className="size-4" />
        Novo prestador
      </LinkButton>

      {prestadores.length === 0 ? (
        <EmptyState
          icone="prestadores"
          titulo="Nenhum prestador cadastrado"
          descricao="Cadastre eletricistas, encanadores, diaristas e outros prestadores."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Dois grids irmãos em vez de um só: num grid único o primeiro
              inativo cairia no meio de uma linha, sem corte visual. Os guardas
              length > 0 são obrigatórios — um div vazio continuaria sendo flex
              item e somaria 12px de gap fantasma no fim da lista.

              2 colunas só a partir de xl (1280) e não de lg (1024): com a ação
              de WhatsApp a linha de ações do card passa a medir 395px de
              largura natural, e em 1024 a coluna dá só 313px úteis — o rodapé
              quebraria em 2 linhas nos 10 cards. Em 1280 sobram 441px. */}
          {ativos.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {ativos.map((p) => (
                <PrestadorCard key={p.id} prestador={p} />
              ))}
            </div>
          ) : null}

          {inativos.length > 0 ? (
            <>
              {/* O heading é lg:-only — `hidden` não gera flex item, então o
                  gap-3 do wrapper continua valendo 12px entre TODOS os cards
                  abaixo de 1024px, exatamente como hoje. */}
              <h2 className="hidden px-1 pt-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted lg:block">
                Inativos
              </h2>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {inativos.map((p) => (
                  <PrestadorCard key={p.id} prestador={p} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
