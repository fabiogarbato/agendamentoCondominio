import { OrcamentoForm } from "@/components/OrcamentoForm";
import { listarPrestadores } from "@/lib/queries/prestadores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NovoOrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const prestadores = await listarPrestadores({ ativo: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Novo orçamento</h1>
      <OrcamentoForm prestadores={prestadores} categoriaInicial={categoria} />
    </div>
  );
}
