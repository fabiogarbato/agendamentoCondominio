import { z } from "zod";
import { STATUS_ORCAMENTO_VALUES } from "@/lib/constants";
import { dataValida } from "@/lib/date-utils";

export const orcamentoSchema = z.object({
  prestadorId: z.coerce.number().int().positive("Selecione um prestador"),
  descricao: z.string().trim().min(2, "Descreva o serviço orçado").max(200),
  // A API recebe o valor já em centavos como NÚMERO (o form converte antes de
  // enviar). Sem z.coerce de propósito: coerce aceitaria true->1, [200]->200 etc.
  valorCentavos: z
    .number("Valor inválido")
    .int("Valor inválido")
    .positive("Informe um valor maior que zero")
    .max(999_999_999, "Valor acima do limite permitido"), // teto R$ 9.999.999,99
  status: z.enum(STATUS_ORCAMENTO_VALUES).optional(),
  validadeAte: z
    .string()
    .refine((v) => v === "" || dataValida(v), "Data inválida")
    .optional()
    .nullable(),
  observacoes: z.string().trim().max(2000).optional().nullable(),
});

export type OrcamentoInput = z.infer<typeof orcamentoSchema>;

export const orcamentoStatusSchema = z.object({
  status: z.enum(STATUS_ORCAMENTO_VALUES),
});
