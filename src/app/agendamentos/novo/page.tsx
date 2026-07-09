import { AgendamentoForm } from "@/components/AgendamentoForm";
import { listarPrestadores } from "@/lib/queries/prestadores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NovoAgendamentoPage() {
  const prestadores = await listarPrestadores({ ativo: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Novo agendamento</h1>
      <AgendamentoForm prestadores={prestadores} />
    </div>
  );
}
