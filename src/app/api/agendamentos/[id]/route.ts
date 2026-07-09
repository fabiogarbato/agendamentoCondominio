import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  agendamentoSchema,
  agendamentoStatusSchema,
} from "@/lib/validations/agendamento.schema";
import { obterAgendamento } from "@/lib/queries/agendamentos";

export const runtime = "nodejs";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/agendamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const agendamento = await obterAgendamento(id);
  if (!agendamento) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }
  return NextResponse.json(agendamento);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/agendamentos/[id]">,
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

  const parsed = agendamentoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        prestadorId: parsed.data.prestadorId,
        data: parsed.data.data,
        horario: parsed.data.horario,
        motivo: parsed.data.motivo,
        observacoes: parsed.data.observacoes ?? null,
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
      include: { prestador: true },
    });
    return NextResponse.json(agendamento);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
      }
      if (e.code === "P2003") {
        return NextResponse.json({ error: "Prestador não encontrado" }, { status: 400 });
      }
    }
    throw e;
  }
}

/** Muda só o status (ex.: marcar como concluído/cancelado) sem reenviar o formulário todo. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/agendamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = agendamentoStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { prestador: true },
    });
    return NextResponse.json(agendamento);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/agendamentos/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  try {
    await prisma.agendamento.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }
    throw e;
  }
}
