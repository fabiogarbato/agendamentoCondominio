"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/api-client";

export function StatusAcoes({ id }: { id: number }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<string | null>(null);

  async function mudarStatus(status: "CONCLUIDO" | "CANCELADO") {
    setCarregando(status);
    try {
      await apiFetch(`/api/agendamentos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "CONCLUIDO" ? "Agendamento concluído" : "Agendamento cancelado");
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar. Tente de novo.");
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={carregando !== null}
        onClick={() => mudarStatus("CONCLUIDO")}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-concluido-bg px-3 text-sm font-medium text-concluido-fg transition-colors hover:bg-concluido-bg/70 disabled:opacity-50"
      >
        <Icon name="check" className="size-4" />
        {carregando === "CONCLUIDO" ? "..." : "Concluir"}
      </button>
      <button
        type="button"
        disabled={carregando !== null}
        onClick={() => mudarStatus("CANCELADO")}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-cancelado-bg px-3 text-sm font-medium text-cancelado-fg transition-colors hover:bg-cancelado-bg/70 disabled:opacity-50"
      >
        <Icon name="x" className="size-4" />
        {carregando === "CANCELADO" ? "..." : "Cancelar"}
      </button>
    </div>
  );
}
