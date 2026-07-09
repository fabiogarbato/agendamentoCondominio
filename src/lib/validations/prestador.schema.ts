import { z } from "zod";
import { CATEGORIA_VALUES } from "@/lib/constants";

export const prestadorSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome do prestador")
      .max(120),
    categoria: z.enum(CATEGORIA_VALUES),
    categoriaOutro: z.string().trim().max(120).optional().nullable(),
    telefone: z
      .string()
      .trim()
      .min(8, "Telefone inválido")
      .max(20)
      .refine((v) => /^[0-9()+\-.\s]+$/.test(v), "Use apenas números e símbolos de telefone"),
    empresa: z.string().trim().max(120).optional().nullable(),
    observacoes: z.string().trim().max(2000).optional().nullable(),
  })
  .refine(
    (data) => data.categoria !== "OUTRO" || Boolean(data.categoriaOutro?.trim()),
    {
      message: "Descreva o tipo de serviço quando a categoria for \"Outro\"",
      path: ["categoriaOutro"],
    },
  );

export type PrestadorInput = z.infer<typeof prestadorSchema>;
