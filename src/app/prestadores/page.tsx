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

      <LinkButton href="/prestadores/novo">
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
          {ativos.map((p) => (
            <PrestadorCard key={p.id} prestador={p} />
          ))}
          {inativos.map((p) => (
            <PrestadorCard key={p.id} prestador={p} />
          ))}
        </div>
      )}
    </div>
  );
}
