import { notFound } from "next/navigation";
import { PrestadorForm } from "@/components/PrestadorForm";
import { obterPrestador } from "@/lib/queries/prestadores";

export const runtime = "nodejs";

export default async function EditarPrestadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const prestador = await obterPrestador(id);
  if (!prestador) notFound();

  return (
    <div className="flex flex-col gap-6 lg:mx-auto lg:max-w-2xl">
      <h1 className="text-xl font-bold">Editar prestador</h1>
      <PrestadorForm prestador={prestador} />
    </div>
  );
}
