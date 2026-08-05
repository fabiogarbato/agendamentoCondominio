import { OrcamentoForm } from "@/components/OrcamentoForm";
import { listarPrestadores } from "@/lib/queries/prestadores";
import { listarServicos } from "@/lib/queries/servicos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NovoOrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico } = await searchParams;
  const [prestadores, servicos] = await Promise.all([
    listarPrestadores({ ativo: true }),
    listarServicos(),
  ]);

  return (
    <div className="flex flex-col gap-6 lg:mx-auto lg:max-w-2xl">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Novo orçamento</h1>
      <OrcamentoForm
        prestadores={prestadores}
        servicos={servicos}
        servicoInicial={servico}
      />
    </div>
  );
}
