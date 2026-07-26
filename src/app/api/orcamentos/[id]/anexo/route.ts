import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Higieniza o nome do arquivo: remove quebras/aspas/barras (evita header
 *  injection no Content-Disposition e path traversal) e garante extensão .pdf. */
function nomeSeguro(nome: string | null | undefined): string {
  const limpo = (nome ?? "")
    .replace(/[\r\n"\\]/g, "")
    .replace(/[/\\]/g, "-")
    .trim();
  const base = limpo || "orcamento.pdf";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

// POST -> anexa (ou substitui) o PDF do orçamento (multipart/form-data, campo "arquivo").
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]/anexo">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const orcamento = await prisma.orcamento.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!orcamento) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const arquivo = form.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }
  if (arquivo.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "PDF muito grande (máximo 10 MB)" },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  // Valida por assinatura (magic number) em vez de confiar no Content-Type do
  // cliente: um PDF de verdade começa com "%PDF-".
  const assinatura = String.fromCharCode(...bytes.subarray(0, 5));
  if (assinatura !== "%PDF-") {
    return NextResponse.json(
      { error: "O arquivo precisa ser um PDF" },
      { status: 400 },
    );
  }

  const nomeArquivo = nomeSeguro(arquivo.name);
  const meta = await prisma.anexo.upsert({
    where: { orcamentoId: id },
    create: {
      orcamentoId: id,
      nomeArquivo,
      tipo: "application/pdf",
      tamanho: arquivo.size,
      conteudo: bytes,
    },
    update: {
      nomeArquivo,
      tipo: "application/pdf",
      tamanho: arquivo.size,
      conteudo: bytes,
    },
    select: { id: true, nomeArquivo: true, tipo: true, tamanho: true },
  });

  return NextResponse.json(meta, { status: 201 });
}

// GET -> baixa/exibe o PDF inline.
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]/anexo">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const anexo = await prisma.anexo.findUnique({ where: { orcamentoId: id } });
  if (!anexo) {
    return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 });
  }

  const fonte =
    anexo.conteudo instanceof Uint8Array
      ? anexo.conteudo
      : new Uint8Array(anexo.conteudo as ArrayBufferLike);
  // Copia para um ArrayBuffer concreto: o tipo Bytes do Prisma é
  // Uint8Array<ArrayBufferLike> (inclui SharedArrayBuffer), que o TS não aceita
  // como BodyInit. Um ArrayBuffer puro é BufferSource válido.
  const corpo = new ArrayBuffer(fonte.byteLength);
  new Uint8Array(corpo).set(fonte);

  const tipo = anexo.tipo || "application/pdf";
  const nome = nomeSeguro(anexo.nomeArquivo);
  const asciiFallback = nome.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(nome);

  return new NextResponse(corpo, {
    status: 200,
    headers: {
      "Content-Type": tipo,
      "Content-Length": String(anexo.tamanho),
      "Content-Disposition": `inline; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
    },
  });
}

// DELETE -> remove o PDF (mantém o orçamento).
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]/anexo">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  try {
    await prisma.anexo.delete({ where: { orcamentoId: id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 });
    }
    throw e;
  }
}
