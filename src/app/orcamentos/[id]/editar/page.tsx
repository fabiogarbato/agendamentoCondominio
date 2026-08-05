import { notFound } from "next/navigation";
import { OrcamentoForm } from "@/components/OrcamentoForm";
import { ExcluirOrcamentoBotao } from "@/components/ExcluirOrcamentoBotao";
import { obterOrcamento } from "@/lib/queries/orcamentos";
import { listarPrestadores } from "@/lib/queries/prestadores";
import { listarServicos } from "@/lib/queries/servicos";

export const runtime = "nodejs";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const [orcamento, prestadores, servicos] = await Promise.all([
    obterOrcamento(id),
    listarPrestadores({ ativo: true }),
    listarServicos(),
  ]);
  if (!orcamento) notFound();

  return (
    <div className="flex flex-col gap-6 lg:mx-auto lg:max-w-2xl">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Editar orçamento</h1>
      <OrcamentoForm
        prestadores={prestadores}
        servicos={servicos}
        orcamento={orcamento}
      />
      <ExcluirOrcamentoBotao id={orcamento.id} redirecionar />
    </div>
  );
}
