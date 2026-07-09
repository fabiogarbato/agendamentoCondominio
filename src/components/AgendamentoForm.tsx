"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { CampoArea, CampoSelect, CampoTexto } from "@/components/ui/Campo";
import { apiFetch, ApiError } from "@/lib/api-client";
import { labelCategoria } from "@/lib/constants";
import { hojeISO } from "@/lib/date-utils";
import type { AgendamentoComPrestador, Prestador } from "@/types";

export function AgendamentoForm({
  prestadores,
  agendamento,
}: {
  prestadores: Prestador[];
  agendamento?: AgendamentoComPrestador;
}) {
  const router = useRouter();
  const editando = Boolean(agendamento);

  const [prestadorId, setPrestadorId] = useState(
    agendamento ? String(agendamento.prestadorId) : String(prestadores[0]?.id ?? ""),
  );
  const [data, setData] = useState(agendamento?.data ?? hojeISO());
  const [horario, setHorario] = useState(agendamento?.horario ?? "");
  const [motivo, setMotivo] = useState(agendamento?.motivo ?? "");
  const [observacoes, setObservacoes] = useState(agendamento?.observacoes ?? "");

  const [enviando, setEnviando] = useState(false);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  async function aoSubmeter(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErrosCampo({});

    const payload = {
      prestadorId: Number(prestadorId),
      data,
      horario,
      motivo,
      observacoes: observacoes || null,
    };

    try {
      if (editando && agendamento) {
        await apiFetch(`/api/agendamentos/${agendamento.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/agendamentos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      toast.success(editando ? "Agendamento atualizado" : "Agendamento criado");
      router.push("/");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        const mapa: Record<string, string> = {};
        if (Array.isArray(e.issues)) {
          for (const issue of e.issues as { path: (string | number)[]; message: string }[]) {
            const chave = String(issue.path[0] ?? "");
            if (chave) mapa[chave] = issue.message;
          }
          setErrosCampo(mapa);
        }
        // Só mostra toast quando NÃO há erro por campo (evita sinalização dupla).
        if (Object.keys(mapa).length === 0) {
          toast.error(e.message || "Não foi possível salvar.");
        }
      } else {
        toast.error("Não foi possível salvar. Tente novamente.");
      }
      setEnviando(false);
    }
  }

  if (prestadores.length === 0 && !editando) {
    return (
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Cadastre um prestador de serviço ativo antes de criar um agendamento.
      </p>
    );
  }

  return (
    <form onSubmit={aoSubmeter} className="flex flex-col gap-4">

      <CampoSelect
        label="Prestador"
        name="prestadorId"
        value={prestadorId}
        onChange={(e) => setPrestadorId(e.target.value)}
        erro={errosCampo.prestadorId}
      >
        {editando && agendamento && !prestadores.some((p) => p.id === agendamento.prestadorId) ? (
          <option value={agendamento.prestadorId}>
            {agendamento.prestador.nome} (inativo)
          </option>
        ) : null}
        {prestadores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} — {labelCategoria(p.categoria)}
          </option>
        ))}
      </CampoSelect>

      <div className="grid grid-cols-2 gap-3">
        <CampoTexto
          label="Data"
          name="data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          erro={errosCampo.data}
          required
        />
        <CampoTexto
          label="Horário"
          name="horario"
          type="time"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          erro={errosCampo.horario}
          required
        />
      </div>

      <CampoTexto
        label="Motivo da visita"
        name="motivo"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        erro={errosCampo.motivo}
        required
        placeholder="Ex.: manutenção do ar-condicionado da sala"
        maxLength={200}
      />

      <CampoArea
        label="Observações (opcional)"
        name="observacoes"
        value={observacoes ?? ""}
        onChange={(e) => setObservacoes(e.target.value)}
        erro={errosCampo.observacoes}
      />

      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Criar agendamento"}
      </Button>
    </form>
  );
}
