"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { CampoArea, CampoSelect, CampoTexto } from "@/components/ui/Campo";
import { apiFetch, ApiError } from "@/lib/api-client";
import { CATEGORIAS_PRESTADOR } from "@/lib/constants";
import type { Prestador } from "@/types";

export function PrestadorForm({ prestador }: { prestador?: Prestador }) {
  const router = useRouter();
  const editando = Boolean(prestador);

  const [nome, setNome] = useState(prestador?.nome ?? "");
  const [categoria, setCategoria] = useState(prestador?.categoria ?? CATEGORIAS_PRESTADOR[0].value);
  const [categoriaOutro, setCategoriaOutro] = useState(prestador?.categoriaOutro ?? "");
  const [telefone, setTelefone] = useState(prestador?.telefone ?? "");
  const [empresa, setEmpresa] = useState(prestador?.empresa ?? "");
  const [observacoes, setObservacoes] = useState(prestador?.observacoes ?? "");

  const [enviando, setEnviando] = useState(false);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  async function aoSubmeter(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErrosCampo({});

    const payload = {
      nome,
      categoria,
      categoriaOutro: categoria === "OUTRO" ? categoriaOutro : null,
      telefone,
      empresa: empresa || null,
      observacoes: observacoes || null,
    };

    try {
      if (editando && prestador) {
        await apiFetch(`/api/prestadores/${prestador.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/prestadores", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      toast.success(editando ? "Prestador atualizado" : "Prestador cadastrado");
      router.push("/prestadores");
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

  return (
    <form onSubmit={aoSubmeter} className="flex flex-col gap-4">

      <CampoTexto
        label="Nome"
        name="nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={errosCampo.nome}
        required
        maxLength={120}
      />

      <CampoSelect
        label="Tipo de serviço"
        name="categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        erro={errosCampo.categoria}
      >
        {CATEGORIAS_PRESTADOR.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </CampoSelect>

      {categoria === "OUTRO" ? (
        <CampoTexto
          label="Descreva o serviço"
          name="categoriaOutro"
          value={categoriaOutro ?? ""}
          onChange={(e) => setCategoriaOutro(e.target.value)}
          erro={errosCampo.categoriaOutro}
        />
      ) : null}

      <CampoTexto
        label="Telefone"
        name="telefone"
        type="tel"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        erro={errosCampo.telefone}
        required
        placeholder="(41) 99999-9999"
      />

      <CampoTexto
        label="Empresa (opcional)"
        name="empresa"
        value={empresa ?? ""}
        onChange={(e) => setEmpresa(e.target.value)}
        erro={errosCampo.empresa}
      />

      <CampoArea
        label="Observações (opcional)"
        name="observacoes"
        value={observacoes ?? ""}
        onChange={(e) => setObservacoes(e.target.value)}
        erro={errosCampo.observacoes}
      />

      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar prestador"}
      </Button>
    </form>
  );
}
