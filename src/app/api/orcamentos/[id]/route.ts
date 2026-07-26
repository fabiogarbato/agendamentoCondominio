import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  orcamentoSchema,
  orcamentoStatusSchema,
} from "@/lib/validations/orcamento.schema";
import { obterOrcamento } from "@/lib/queries/orcamentos";
import { acharOuCriarServico } from "@/lib/queries/servicos";

export const runtime = "nodejs";

const incluirRelacoes = {
  servico: true,
  prestador: true,
  anexo: { select: { id: true, nomeArquivo: true, tipo: true, tamanho: true } },
} satisfies Prisma.OrcamentoInclude;

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const orcamento = await obterOrcamento(id);
  if (!orcamento) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }
  return NextResponse.json(orcamento);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = orcamentoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const orcamento = await prisma.$transaction(async (tx) => {
      const servicoId = await acharOuCriarServico(tx, parsed.data.servicoNome);
      return tx.orcamento.update({
        where: { id },
        data: {
          servicoId,
          prestadorId: parsed.data.prestadorId,
          descricao: parsed.data.descricao?.trim() || null,
          valorCentavos: parsed.data.valorCentavos,
          validadeAte: parsed.data.validadeAte || null,
          observacoes: parsed.data.observacoes ?? null,
          ...(parsed.data.status ? { status: parsed.data.status } : {}),
        },
        include: incluirRelacoes,
      });
    });
    return NextResponse.json(orcamento);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
      }
      if (e.code === "P2003") {
        return NextResponse.json({ error: "Prestador não encontrado" }, { status: 400 });
      }
    }
    throw e;
  }
}

/** Muda só o status (aceitar/recusar) sem reenviar o formulário todo. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = orcamentoStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: { status: parsed.data.status },
      include: incluirRelacoes,
    });
    return NextResponse.json(orcamento);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/orcamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  try {
    // O anexo (PDF) sai junto por cascade definido no schema.
    await prisma.orcamento.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }
    throw e;
  }
}
