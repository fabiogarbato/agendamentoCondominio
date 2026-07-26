import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Lista serviços (para o autocomplete do formulário e telas de comparação). */
export function listarServicos() {
  return prisma.servico.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { orcamentos: true } } },
  });
}

/**
 * Acha um serviço pelo nome (comparação case-insensitive, ignorando espaços nas
 * pontas) ou cria um novo. Recebe um client de transação para que a criação do
 * serviço e a do orçamento aconteçam de forma atômica — sem serviço órfão se o
 * orçamento falhar depois.
 *
 * A tabela de serviços é pequena (app pessoal), então carregar todos e comparar
 * em memória é barato e evita depender de `mode: "insensitive"`, que o conector
 * SQLite do Prisma não suporta.
 */
export async function acharOuCriarServico(
  tx: Prisma.TransactionClient,
  nome: string,
): Promise<number> {
  const alvo = nome.trim();
  const chave = alvo.toLowerCase();
  const existentes = await tx.servico.findMany({ select: { id: true, nome: true } });
  const achado = existentes.find((s) => s.nome.trim().toLowerCase() === chave);
  if (achado) return achado.id;
  const criado = await tx.servico.create({ data: { nome: alvo } });
  return criado.id;
}
