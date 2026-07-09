"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { CampoArea, CampoSelect, CampoTexto } from "@/components/ui/Campo";
import { apiFetch, ApiError } from "@/lib/api-client";
import { STATUS_ORCAMENTO, labelCategoria } from "@/lib/constants";
import { centavosParaReais, parseValorParaCentavos } from "@/lib/money";
import type { OrcamentoComPrestador, Prestador } from "@/types";

export function OrcamentoForm({
  prestadores,
  orcamento,
  categoriaInicial,
}: {
  prestadores: Prestador[];
  orcamento?: OrcamentoComPrestador;
  categoriaInicial?: string;
}) {
  const router = useRouter();
  const editando = Boolean(orcamento);

  const prestadorPadrao =
    prestadores.find((p) => p.categoria === categoriaInicial)?.id ?? prestadores[0]?.id;

  const [prestadorId, setPrestadorId] = useState(
    orcamento ? String(orcamento.prestadorId) : String(prestadorPadrao ?? ""),
  );
  const [descricao, setDescricao] = useState(orcamento?.descricao ?? "");
  const [valor, setValor] = useState(
    orcamento ? centavosParaReais(orcamento.valorCentavos) : "",
  );
  const [status, setStatus] = useState(orcamento?.status ?? "PENDENTE");
  const [validadeAte, setValidadeAte] = useState(orcamento?.validadeAte ?? "");
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes ?? "");

  const [enviando, setEnviando] = useState(false);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  async function aoSubmeter(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErrosCampo({});

    const valorCentavos = parseValorParaCentavos(valor);
    if (valorCentavos === null || valorCentavos <= 0) {
      setErrosCampo({ valorCentavos: "Informe um valor válido maior que zero" });
      setEnviando(false);
      return;
    }

    const payload = {
      prestadorId: Number(prestadorId),
      descricao,
      valorCentavos,
      status,
      validadeAte: validadeAte || null,
      observacoes: observacoes || null,
    };

    try {
      if (editando && orcamento) {
        await apiFetch(`/api/orcamentos/${orcamento.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/orcamentos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      toast.success(editando ? "Orçamento atualizado" : "Orçamento criado");
      router.push("/orcamentos");
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
        Cadastre um prestador de serviço ativo antes de criar um orçamento.
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
        {editando && orcamento && !prestadores.some((p) => p.id === orcamento.prestadorId) ? (
          <option value={orcamento.prestadorId}>{orcamento.prestador.nome} (inativo)</option>
        ) : null}
        {prestadores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} — {labelCategoria(p.categoria)}
          </option>
        ))}
      </CampoSelect>

      <CampoTexto
        label="Serviço orçado"
        name="descricao"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        erro={errosCampo.descricao}
        required
        placeholder="Ex.: troca do disjuntor geral"
        maxLength={200}
      />

      <div className="grid grid-cols-2 gap-3">
        <CampoTexto
          label="Valor (R$)"
          name="valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          erro={errosCampo.valorCentavos}
          required
          inputMode="decimal"
          placeholder="0,00"
        />
        <CampoTexto
          label="Válido até (opcional)"
          name="validadeAte"
          type="date"
          value={validadeAte}
          onChange={(e) => setValidadeAte(e.target.value)}
          erro={errosCampo.validadeAte}
        />
      </div>

      <CampoSelect
        label="Status"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        erro={errosCampo.status}
      >
        {STATUS_ORCAMENTO.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </CampoSelect>

      <CampoArea
        label="Observações (opcional)"
        name="observacoes"
        value={observacoes ?? ""}
        onChange={(e) => setObservacoes(e.target.value)}
        erro={errosCampo.observacoes}
      />

      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Criar orçamento"}
      </Button>
    </form>
  );
}
