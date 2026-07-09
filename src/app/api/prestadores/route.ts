import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prestadorSchema } from "@/lib/validations/prestador.schema";
import { listarPrestadores } from "@/lib/queries/prestadores";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ativoParam = request.nextUrl.searchParams.get("ativo");
  const ativo = ativoParam === null ? undefined : ativoParam === "true";
  const prestadores = await listarPrestadores({ ativo });
  return NextResponse.json(prestadores);
}

export async function POST(request: NextRequest) {
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

  const prestador = await prisma.prestador.create({ data: parsed.data });
  return NextResponse.json(prestador, { status: 201 });
}
