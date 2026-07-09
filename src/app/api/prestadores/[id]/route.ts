import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { prestadorSchema } from "@/lib/validations/prestador.schema";
import { obterPrestador } from "@/lib/queries/prestadores";

export const runtime = "nodejs";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/prestadores/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const prestador = await obterPrestador(id);
  if (!prestador) {
    return NextResponse.json({ error: "Prestador não encontrado" }, { status: 404 });
  }
  return NextResponse.json(prestador);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/prestadores/[id]">,
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

  const parsed = prestadorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const prestador = await prisma.prestador.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(prestador);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Prestador não encontrado" }, { status: 404 });
    }
    throw e;
  }
}

/** Alterna o campo `ativo` (soft delete/reativação), sem apagar histórico. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/prestadores/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.ativo !== "boolean") {
    return NextResponse.json({ error: "Campo 'ativo' (boolean) é obrigatório" }, { status: 400 });
  }

  try {
    const prestador = await prisma.prestador.update({
      where: { id },
      data: { ativo: body.ativo },
    });
    return NextResponse.json(prestador);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Prestador não encontrado" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/prestadores/[id]">,
) {
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  try {
    await prisma.prestador.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Prestador não encontrado" }, { status: 404 });
      }
      if (e.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Não é possível excluir: este prestador tem agendamentos ou orçamentos vinculados. Desative-o em vez de excluir.",
          },
          { status: 409 },
        );
      }
    }
    throw e;
  }
}
