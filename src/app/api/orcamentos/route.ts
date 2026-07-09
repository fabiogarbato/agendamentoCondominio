import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orcamentoSchema } from "@/lib/validations/orcamento.schema";
import { listarOrcamentos } from "@/lib/queries/orcamentos";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const categoria = request.nextUrl.searchParams.get("categoria") ?? undefined;
  return NextResponse.json(await listarOrcamentos({ categoria }));
}

export async function POST(request: NextRequest) {
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
    const orcamento = await prisma.orcamento.create({
      data: {
        prestadorId: parsed.data.prestadorId,
        descricao: parsed.data.descricao,
        valorCentavos: parsed.data.valorCentavos,
        status: parsed.data.status ?? "PENDENTE",
        validadeAte: parsed.data.validadeAte || null,
        observacoes: parsed.data.observacoes ?? null,
      },
      include: { prestador: true },
    });
    return NextResponse.json(orcamento, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json({ error: "Prestador não encontrado" }, { status: 400 });
    }
    throw e;
  }
}
