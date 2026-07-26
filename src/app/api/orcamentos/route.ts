import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orcamentoSchema } from "@/lib/validations/orcamento.schema";
import { listarOrcamentos } from "@/lib/queries/orcamentos";
import { acharOuCriarServico } from "@/lib/queries/servicos";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const servicoIdParam = request.nextUrl.searchParams.get("servicoId");
  const servicoId = servicoIdParam ? Number(servicoIdParam) : undefined;
  return NextResponse.json(
    await listarOrcamentos(
      servicoId && Number.isInteger(servicoId) ? { servicoId } : {},
    ),
  );
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
    // Serviço e orçamento na mesma transação: se algo falhar, não fica serviço órfão.
    const orcamento = await prisma.$transaction(async (tx) => {
      const servicoId = await acharOuCriarServico(tx, parsed.data.servicoNome);
      return tx.orcamento.create({
        data: {
          servicoId,
          prestadorId: parsed.data.prestadorId,
          descricao: parsed.data.descricao?.trim() || null,
          valorCentavos: parsed.data.valorCentavos,
          status: parsed.data.status ?? "PENDENTE",
          validadeAte: parsed.data.validadeAte || null,
          observacoes: parsed.data.observacoes ?? null,
        },
        include: {
          servico: true,
          prestador: true,
          anexo: { select: { id: true, nomeArquivo: true, tipo: true, tamanho: true } },
        },
      });
    });
    return NextResponse.json(orcamento, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json({ error: "Prestador não encontrado" }, { status: 400 });
    }
    throw e;
  }
}
