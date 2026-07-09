import { PrestadorForm } from "@/components/PrestadorForm";

export default function NovoPrestadorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Novo prestador</h1>
      <PrestadorForm />
    </div>
  );
}
