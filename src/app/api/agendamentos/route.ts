import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { agendamentoSchema } from "@/lib/validations/agendamento.schema";
import { listarDoMes, listarHistorico, listarProximos } from "@/lib/queries/agendamentos";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const modo = params.get("modo") ?? "proximos";

  if (modo === "mes") {
    const ano = Number(params.get("ano"));
    const mes = Number(params.get("mes"));
    if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
      return NextResponse.json({ error: "Parâmetros 'ano'/'mes' inválidos" }, { status: 400 });
    }
    return NextResponse.json(await listarDoMes(ano, mes));
  }

  if (modo === "historico") {
    return NextResponse.json(
      await listarHistorico({
        status: params.get("status") ?? undefined,
        dataInicio: params.get("dataInicio") ?? undefined,
        dataFim: params.get("dataFim") ?? undefined,
      }),
    );
  }

  return NextResponse.json(await listarProximos());
}

export async function POST(request: NextRequest) {
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
    const agendamento = await prisma.agendamento.create({
      data: {
        prestadorId: parsed.data.prestadorId,
        data: parsed.data.data,
        horario: parsed.data.horario,
        motivo: parsed.data.motivo,
        observacoes: parsed.data.observacoes ?? null,
        status: parsed.data.status ?? "AGENDADO",
      },
      include: { prestador: true },
    });
    return NextResponse.json(agendamento, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json({ error: "Prestador não encontrado" }, { status: 400 });
    }
    throw e;
  }
}
