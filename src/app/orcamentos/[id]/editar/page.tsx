import { notFound } from "next/navigation";
import { OrcamentoForm } from "@/components/OrcamentoForm";
import { ExcluirOrcamentoBotao } from "@/components/ExcluirOrcamentoBotao";
import { obterOrcamento } from "@/lib/queries/orcamentos";
import { listarPrestadores } from "@/lib/queries/prestadores";

export const runtime = "nodejs";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const [orcamento, prestadores] = await Promise.all([
    obterOrcamento(id),
    listarPrestadores({ ativo: true }),
  ]);
  if (!orcamento) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Editar orçamento</h1>
      <OrcamentoForm prestadores={prestadores} orcamento={orcamento} />
      <ExcluirOrcamentoBotao id={orcamento.id} redirecionar />
    </div>
  );
}
