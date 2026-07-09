import { z } from "zod";
import { STATUS_VALUES } from "@/lib/constants";
import { dataValida, horarioValido } from "@/lib/date-utils";

export const agendamentoSchema = z.object({
  prestadorId: z.coerce.number().int().positive("Selecione um prestador"),
  data: z
    .string()
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida")
    .refine(dataValida, "Essa data não existe no calendário"),
  horario: z
    .string()
    .refine(horarioValido, "Horário inválido (use HH:mm)"),
  motivo: z.string().trim().min(2, "Descreva o motivo da visita").max(200),
  observacoes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(STATUS_VALUES).optional(),
});

export type AgendamentoInput = z.infer<typeof agendamentoSchema>;

export const agendamentoStatusSchema = z.object({
  status: z.enum(STATUS_VALUES),
});
