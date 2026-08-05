import { notFound } from "next/navigation";
import { AgendamentoForm } from "@/components/AgendamentoForm";
import { ExcluirAgendamentoBotao } from "@/components/ExcluirAgendamentoBotao";
import { obterAgendamento } from "@/lib/queries/agendamentos";
import { listarPrestadores } from "@/lib/queries/prestadores";

export const runtime = "nodejs";

export default async function EditarAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const [agendamento, prestadores] = await Promise.all([
    obterAgendamento(id),
    listarPrestadores({ ativo: true }),
  ]);
  if (!agendamento) notFound();

  return (
    <div className="flex flex-col gap-6 lg:mx-auto lg:max-w-2xl">
      <h1 className="text-xl font-bold">Editar agendamento</h1>
      <AgendamentoForm prestadores={prestadores} agendamento={agendamento} />
      <ExcluirAgendamentoBotao id={agendamento.id} />
    </div>
  );
}
