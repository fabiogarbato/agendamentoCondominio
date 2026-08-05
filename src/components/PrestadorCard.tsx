"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Icon } from "@/components/ui/Icon";
import { apiFetch, ApiError } from "@/lib/api-client";
import { labelCategoria } from "@/lib/constants";
import { formatarTelefoneBR, normalizarTelefoneBR } from "@/lib/telefone";
import type { PrestadorComContagem } from "@/types";

export function PrestadorCard({ prestador }: { prestador: PrestadorComContagem }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  // null quando o telefone não vira um número discável — aí a ação nem aparece.
  const tel = normalizarTelefoneBR(prestador.telefone);
  // O card é onde se clica no dia a dia, e prestadores criados por importação/API
  // nunca passaram pelo aviso do formulário. Então o número REALMENTE discado vai
  // no title — e quando o 9 foi completado por nós, isso fica dito com todas as
  // letras, porque aí o número pode ser de outro assinante.
  const tituloWhatsApp = tel
    ? tel.nonoDigitoAdicionado
      ? `Abrir conversa em ${formatarTelefoneBR(tel)} — o 9 foi completado automaticamente, confira o número`
      : `Abrir conversa em ${formatarTelefoneBR(tel)}`
    : undefined;

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
        {tel ? (
          <a
            href={`https://wa.me/${tel.e164}`}
            target="_blank"
            rel="noopener noreferrer"
            title={tituloWhatsApp}
            aria-label={`Chamar ${prestador.nome} no WhatsApp`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Icon name="whatsapp" className="size-4" />
            WhatsApp
            {tel.nonoDigitoAdicionado ? (
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            ) : null}
          </a>
        ) : null}
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
