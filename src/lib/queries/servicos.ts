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
 * Chave de comparação de nome de serviço. Dois nomes que o usuário LÊ como
 * iguais têm que cair no mesmo grupo — senão a comparação de preços, que é o
 * objetivo da tela de orçamentos, some sem ninguém perceber.
 *
 * Além de caixa e espaço nas pontas, normaliza três casos que aparecem ao COLAR
 * texto de PDF/Word/WhatsApp e que geram serviços visualmente idênticos:
 *   - NFC: "Dedetização" digitado (NFC) x colado em NFD ("c" + acento solto);
 *   - NBSP (U+00A0) e afins no lugar do espaço comum;
 *   - espaço interno duplicado, que o HTML colapsa na exibição — ou seja, nem
 *     lendo a tela dá para distinguir os dois serviços.
 */
function chaveServico(nome: string): string {
  return nome
    .normalize("NFC")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

/**
 * Acha um serviço pelo nome (ver chaveServico) ou cria um novo. Recebe um client
 * de transação para que a criação do serviço e a do orçamento aconteçam de forma
 * atômica — sem serviço órfão se o orçamento falhar depois.
 *
 * A tabela de serviços é pequena (app pessoal), então carregar todos e comparar
 * em memória é barato e evita depender de `mode: "insensitive"`, que o conector
 * SQLite do Prisma não suporta.
 */
export async function acharOuCriarServico(
  tx: Prisma.TransactionClient,
  nome: string,
): Promise<number> {
  const chave = chaveServico(nome);
  const existentes = await tx.servico.findMany({ select: { id: true, nome: true } });
  const achado = existentes.find((s) => chaveServico(s.nome) === chave);
  if (achado) return achado.id;
  // Grava já normalizado (NFC + espaços colapsados): o que entra no banco é o
  // mesmo texto que a chave compara, então o autocomplete não oferece gêmeos.
  const criado = await tx.servico.create({ data: { nome: nome.normalize("NFC").replace(/\s+/gu, " ").trim() } });
  return criado.id;
}
