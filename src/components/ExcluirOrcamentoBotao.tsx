"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/api-client";

export function ExcluirOrcamentoBotao({
  id,
  redirecionar = false,
}: {
  id: number;
  /** true na página de edição (volta pra /orcamentos); false no card da comparação. */
  redirecionar?: boolean;
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function excluir() {
    if (!confirm("Excluir este orçamento definitivamente?")) return;
    setCarregando(true);
    try {
      await apiFetch(`/api/orcamentos/${id}`, { method: "DELETE" });
      toast.success("Orçamento excluído");
      if (redirecionar) router.push("/orcamentos");
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir. Tente de novo.");
      setCarregando(false);
    }
  }

  return (
    <button
      type="button"
      disabled={carregando}
      onClick={excluir}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-danger disabled:opacity-50"
    >
      <Icon name="lixeira" className="size-4" />
      {carregando ? "Excluindo..." : "Excluir"}
    </button>
  );
}
