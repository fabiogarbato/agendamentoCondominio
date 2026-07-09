// Helpers de data "de parede" (sem fuso horário) para o app.
// Convenção: datas persistidas como string "YYYY-MM-DD" e horários como "HH:mm".
// Nunca usar `new Date(isoString)` para essas strings (seria interpretado como
// UTC) — sempre construir `new Date(ano, mesIndex, dia)` (hora local).

export function hojeISO(): string {
  const agora = new Date();
  return formatarISO(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());
}

export function formatarISO(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function prefixoMes(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}`;
}

/** Valida se "YYYY-MM-DD" é uma data de calendário real (rejeita 30/02, 31/04 etc). */
export function dataValida(valor: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!match) return false;
  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const d = new Date(ano, mes - 1, dia);
  return (
    d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
  );
}

/** Valida "HH:mm" em formato 24h. */
export function horarioValido(valor: string): boolean {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(valor);
  return match !== null;
}

export function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

export function diaDaSemanaLabel(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return DIAS_SEMANA_ABREV[d.getDay()];
}

export const DIAS_SEMANA_ABREV = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function isHoje(iso: string): boolean {
  return iso === hojeISO();
}

/** true se a data está entre hoje e os próximos `dias` dias (inclusive). */
export function isProximosDias(iso: string, dias: number): boolean {
  const hoje = hojeISO();
  if (iso < hoje) return false;
  const limite = adicionarDias(hoje, dias);
  return iso <= limite;
}

export function isPassado(iso: string): boolean {
  return iso < hojeISO();
}

export function adicionarDias(iso: string, dias: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  d.setDate(d.getDate() + dias);
  return formatarISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export type CelulaCalendario = {
  data: string;
  dia: number;
  foraDoMes: boolean;
  hoje: boolean;
};

/** Gera a grade de semanas (domingo-sábado) do mês, incluindo dias do mês
 * anterior/seguinte para completar as semanas — tudo com Date local. */
export function gradeDoMes(ano: number, mes: number): CelulaCalendario[][] {
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);
  const inicioGrade = new Date(primeiroDia);
  inicioGrade.setDate(inicioGrade.getDate() - primeiroDia.getDay());
  const fimGrade = new Date(ultimoDia);
  fimGrade.setDate(fimGrade.getDate() + (6 - ultimoDia.getDay()));

  const semanas: CelulaCalendario[][] = [];
  let semanaAtual: CelulaCalendario[] = [];
  const cursor = new Date(inicioGrade);
  const hoje = hojeISO();

  while (cursor <= fimGrade) {
    const iso = formatarISO(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    semanaAtual.push({
      data: iso,
      dia: cursor.getDate(),
      foraDoMes: cursor.getMonth() !== mes - 1,
      hoje: iso === hoje,
    });
    if (semanaAtual.length === 7) {
      semanas.push(semanaAtual);
      semanaAtual = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return semanas;
}
