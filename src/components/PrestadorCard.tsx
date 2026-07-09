"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Icon } from "@/components/ui/Icon";
import { apiFetch, ApiError } from "@/lib/api-client";
import { labelCategoria } from "@/lib/constants";
import type { PrestadorComContagem } from "@/types";

export function PrestadorCard({ prestador }: { prestador: PrestadorComContagem }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function alternarAtivo() {
    setCarregando(true);
    try {
      await apiFetch(`/api/prestadores/${prestador.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !prestador.ativo }),
      });
      toast.success(prestador.ativo ? "Prestador desativado" : "Prestador reativado");
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar.");
    } finally {
      setCarregando(false);
    }
  }

  async function excluir() {
    if (!confirm(`Excluir "${prestador.nome}" definitivamente?`)) return;
    setCarregando(true);
    try {
      await apiFetch(`/api/prestadores/${prestador.id}`, { method: "DELETE" });
      toast.success("Prestador excluído");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Não foi possível excluir.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 shadow-card ${prestador.ativo ? "" : "opacity-60"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{prestador.nome}</p>
          <p className="text-sm text-muted">
            {labelCategoria(prestador.categoria)}
            {prestador.categoria === "OUTRO" && prestador.categoriaOutro
              ? ` (${prestador.categoriaOutro})`
              : ""}
          </p>
        </div>
        {!prestador.ativo ? (
          <span className="rounded-full bg-cancelado-bg px-2.5 py-1 text-xs font-medium text-cancelado-fg">
            Inativo
          </span>
        ) : null}
      </div>

      <div className="mt-2 text-sm text-foreground">
        <p>{prestador.telefone}</p>
        {prestador.empresa ? <p className="text-muted">{prestador.empresa}</p> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href={`/prestadores/${prestador.id}/editar`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <Icon name="lapis" className="size-4" />
          Editar
        </Link>
        <button
          type="button"
          disabled={carregando}
          onClick={alternarAtivo}
          className="text-sm font-medium text-muted disabled:opacity-50"
        >
          {prestador.ativo ? "Desativar" : "Reativar"}
        </button>
        {prestador._count.agendamentos === 0 && prestador._count.orcamentos === 0 ? (
          <button
            type="button"
            disabled={carregando}
            onClick={excluir}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-danger disabled:opacity-50"
          >
            <Icon name="lixeira" className="size-4" />
            Excluir
          </button>
        ) : (
          <span className="text-xs text-muted">
            {[
              prestador._count.agendamentos > 0 && `${prestador._count.agendamentos} agendamento(s)`,
              prestador._count.orcamentos > 0 && `${prestador._count.orcamentos} orçamento(s)`,
            ]
              .filter(Boolean)
              .join(" e ")}{" "}
            no histórico
          </span>
        )}
      </div>
    </div>
  );
}
