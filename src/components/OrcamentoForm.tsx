"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { CampoArea, CampoSelect, CampoTexto } from "@/components/ui/Campo";
import { Icon } from "@/components/ui/Icon";
import { apiFetch, ApiError } from "@/lib/api-client";
import { STATUS_ORCAMENTO, labelCategoria } from "@/lib/constants";
import { centavosParaReais, parseValorParaCentavos } from "@/lib/money";
import type { OrcamentoComRelacoes, Prestador } from "@/types";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OrcamentoForm({
  prestadores,
  servicos,
  orcamento,
  servicoInicial,
}: {
  prestadores: Prestador[];
  servicos: { id: number; nome: string }[];
  orcamento?: OrcamentoComRelacoes;
  servicoInicial?: string;
}) {
  const router = useRouter();
  const editando = Boolean(orcamento);

  const [prestadorId, setPrestadorId] = useState(
    orcamento ? String(orcamento.prestadorId) : String(prestadores[0]?.id ?? ""),
  );
  const [servicoNome, setServicoNome] = useState(
    orcamento?.servico.nome ?? servicoInicial ?? "",
  );
  const [descricao, setDescricao] = useState(orcamento?.descricao ?? "");
  const [valor, setValor] = useState(
    orcamento ? centavosParaReais(orcamento.valorCentavos) : "",
  );
  const [status, setStatus] = useState(orcamento?.status ?? "PENDENTE");
  const [validadeAte, setValidadeAte] = useState(orcamento?.validadeAte ?? "");
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes ?? "");

  // Anexo (PDF)
  const anexoAtual = orcamento?.anexo ?? null;
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [removerAnexo, setRemoverAnexo] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [enviando, setEnviando] = useState(false);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setArquivo(null);
      return;
    }
    const ehPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!ehPdf) {
      toast.error("Selecione um arquivo PDF");
      if (inputArquivoRef.current) inputArquivoRef.current.value = "";
      return;
    }
    if (f.size > MAX_PDF_BYTES) {
      toast.error("PDF muito grande (máximo 10 MB)");
      if (inputArquivoRef.current) inputArquivoRef.current.value = "";
      return;
    }
    setArquivo(f);
    setRemoverAnexo(false);
  }

  function limparSelecao() {
    setArquivo(null);
    if (inputArquivoRef.current) inputArquivoRef.current.value = "";
  }

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
    if (servicoNome.trim().length < 2) {
      setErrosCampo({ servicoNome: "Diga para qual serviço é este orçamento" });
      setEnviando(false);
      return;
    }

    const payload = {
      prestadorId: Number(prestadorId),
      servicoNome: servicoNome.trim(),
      descricao: descricao.trim() || null,
      valorCentavos,
      status,
      validadeAte: validadeAte || null,
      observacoes: observacoes || null,
    };

    let id: number;
    try {
      if (editando && orcamento) {
        await apiFetch(`/api/orcamentos/${orcamento.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        id = orcamento.id;
      } else {
        const criado = await apiFetch<{ id: number }>("/api/orcamentos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        id = criado.id;
      }
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
      return;
    }

    // Orçamento salvo. Agora os anexos (PDF), que vão numa requisição separada.
    try {
      if (editando && removerAnexo && anexoAtual && !arquivo) {
        const r = await fetch(`/api/orcamentos/${id}/anexo`, { method: "DELETE" });
        if (!r.ok && r.status !== 404) throw new Error("Não foi possível remover o PDF");
      }
      if (arquivo) {
        const fd = new FormData();
        fd.append("arquivo", arquivo);
        const r = await fetch(`/api/orcamentos/${id}/anexo`, { method: "POST", body: fd });
        if (!r.ok) {
          const corpo = await r.json().catch(() => ({}));
          throw new Error(corpo.error || "Não foi possível anexar o PDF");
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha no anexo";
      toast.error(`Orçamento salvo, mas o PDF não subiu: ${msg}. Tente de novo aqui.`);
      router.push(`/orcamentos/${id}/editar`);
      router.refresh();
      return;
    }

    toast.success(editando ? "Orçamento atualizado" : "Orçamento criado");
    router.push("/orcamentos");
    router.refresh();
  }

  if (prestadores.length === 0 && !editando) {
    return (
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Cadastre um prestador de serviço ativo antes de criar um orçamento.
      </p>
    );
  }

  const mostrarAnexoExistente = anexoAtual && !arquivo && !removerAnexo;

  return (
    <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
      <div>
        <CampoTexto
          label="Serviço"
          name="servicoNome"
          value={servicoNome}
          onChange={(e) => setServicoNome(e.target.value)}
          erro={errosCampo.servicoNome}
          required
          list="lista-servicos"
          placeholder="Ex.: Papel de parede da sala"
          maxLength={120}
          autoComplete="off"
        />
        <datalist id="lista-servicos">
          {servicos.map((s) => (
            <option key={s.id} value={s.nome} />
          ))}
        </datalist>
        <p className="mt-1.5 text-xs text-muted">
          Escolha um serviço já usado ou digite um novo. Só orçamentos do{" "}
          <b className="font-semibold text-foreground">mesmo serviço</b> são comparados
          entre si.
        </p>
      </div>

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

      <CampoTexto
        label="Detalhe do orçamento (opcional)"
        name="descricao"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        erro={errosCampo.descricao}
        placeholder="Ex.: com material incluso"
        maxLength={200}
      />

      {/* Anexo PDF */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">PDF do orçamento (opcional)</span>

        {mostrarAnexoExistente ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
            <a
              href={`/api/orcamentos/${orcamento!.id}/anexo`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-primary"
            >
              <Icon name="orcamentos" className="size-4 shrink-0" />
              <span className="truncate">{anexoAtual!.nomeArquivo}</span>
              <span className="shrink-0 text-xs text-muted">
                ({formatarTamanho(anexoAtual!.tamanho)})
              </span>
            </a>
            <button
              type="button"
              onClick={() => setRemoverAnexo(true)}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-danger"
            >
              <Icon name="lixeira" className="size-4" />
              Remover
            </button>
          </div>
        ) : arquivo ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
            <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
              <Icon name="orcamentos" className="size-4 shrink-0 text-primary" />
              <span className="truncate">{arquivo.name}</span>
              <span className="shrink-0 text-xs text-muted">
                ({formatarTamanho(arquivo.size)})
              </span>
            </span>
            <button
              type="button"
              onClick={limparSelecao}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-danger"
            >
              <Icon name="x" className="size-4" />
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputArquivoRef}
              type="file"
              name="arquivo"
              accept="application/pdf,.pdf"
              onChange={aoEscolherArquivo}
              className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
            />
            {removerAnexo && anexoAtual ? (
              <p className="text-xs text-danger">
                O PDF atual será removido ao salvar.{" "}
                <button
                  type="button"
                  onClick={() => setRemoverAnexo(false)}
                  className="font-medium underline"
                >
                  Desfazer
                </button>
              </p>
            ) : (
              <p className="text-xs text-muted">Apenas PDF, até 10 MB.</p>
            )}
          </>
        )}
      </div>

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
