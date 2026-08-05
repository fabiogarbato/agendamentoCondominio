// Telefone BR -> número discável no WhatsApp (wa.me exige só dígitos, com DDI, sem "+").
// Função PURA e à prova de exceção: PrestadorCard é client component e um throw
// aqui derrubaria o card inteiro. Entrada inválida devolve null, nunca lança.
//
// Ordem dos passos (a ordem importa, ver tabela):
//   1. só dígitos  2. não-geográficos  3. DDI 55  4. trunk 0  5. DDD real  6. nono dígito
//
// Tabela de casos:
//   "(11) 98812-4477"        -> 5511988124477  celular, 9 já presente
//   "+55 (11) 98812-4477"    -> 5511988124477  DDI cortado (13 dígitos)
//   "(011) 98812-4477"       -> 5511988124477  trunk 0 cortado (12 dígitos, começa com 0)
//   "+55 (011) 98812-4477"   -> 5511988124477  DDI + trunk 0 (14 dígitos) — corta os dois
//   "0055 11 98812-4477"     -> 5511988124477  "00" = acesso internacional
//   "(11) 3355-8890"         -> 551133558890   FIXO: 8 dígitos começando em 2/3/4/5, NUNCA ganha 9
//   "(11) 8812-4477"         -> 5511988124477  8 dígitos começando em 6/7/8/9 -> prefixa "9"
//   "(11) 9881-2447"         -> 5511998812447  idem — e é EXATAMENTE o mesmo resultado de
//   "(11) 98812-447"         -> 5511998812447  um dígito perdido no meio. Ver limite (a).
//   "(55) 99145-2033"        -> 5555991452033  DDD 55 (Santa Maria/RS) NÃO é cortado: 11 dígitos
//   "555533221100"           -> 555533221100   DDI 55 + DDD 55 + fixo (12 dígitos -> corta só o DDI)
//   "98812-4477"             -> null           sem DDD
//   "0800 123 4567"          -> null           não-geográfico
//   "(20) 99999-9999"        -> null           DDD inexistente
//   "--------" / "()()()()"  -> null           zero dígitos
//   "+1 (415) 555-2671"      -> null           estrangeiro (cai por tamanho ou por assinante inválido)
//
// LIMITE CONHECIDO (documentado de propósito):
//   a) 8 dígitos começando com 9 — "(11) 9881-2447" — são tratados como celular a que
//      faltou o nono dígito e viram 5511998812447. NÃO existe forma de distinguir
//      "faltou o 9 na frente" de "caiu um dígito do meio": os dois casos são a mesma
//      string. O número gerado PODE ser de outro assinante. Por isso o formulário do
//      prestador mostra em texto o número que vai abrir no WhatsApp.
//   b) Números não-geográficos só são barrados nos prefixos 0300/0500/0800/0900.
//      Faixas 3003/4003/4004 NÃO são detectáveis aqui: "(11) 4003-1234" é
//      indistinguível de um fixo comum e passa como fixo; sozinho ("40031234")
//      já morre por não ter DDD.
//   c) Um número estrangeiro de 11 dígitos cujo 1º-2º dígitos formem um DDD válido e
//      cujo 3º dígito seja 9 (ex.: "+1 292 555 1234") passa como celular BR. Sem uma
//      base de prefixos internacionais não há como separar.
//   d) Um celular de 9 dígitos digitado SEM DDD ("998812-4477") tem 10 dígitos e é
//      byte-a-byte igual a um número com DDD ("(99) 8812-4477"); vira 5599988124477.
//      Sem DDD só é rejeitado o caso de 8 dígitos ("98812-4477" -> null).
//   e) DDI digitado mas DDD esquecido: "+55 98812-4477" vira "55988124477" (11
//      dígitos), e como o corte do DDI só acontece com 12+ (limite (f)), o "55"
//      é lido como DDD -> 5555988124477, um número de Santa Maria/RS. É
//      indistinguível de um celular legítimo do DDD 55 digitado sem DDI: as duas
//      entradas são a MESMA string de dígitos. Não tem conserto algorítmico.
//   f) O corte do DDI exige 12+ dígitos justamente para preservar o DDD 55; é o
//      que causa (e). Trocar esse limiar quebraria Santa Maria/RS, que é o caso
//      legítimo — preferimos preservar o número real a adivinhar o incompleto.

/** DDDs realmente em uso no Brasil (67). Qualquer outro par é lixo de digitação. */
const DDDS_VALIDOS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

export type TelefoneBR = {
  /** "5511988124477" — DDI + DDD + assinante, só dígitos, SEM "+" (formato do wa.me). */
  e164: string;
  /** "11" */
  ddd: string;
  /** Assinante já com o nono dígito quando for celular: "988124477" / "33558890". */
  numero: string;
  tipo: "celular" | "fixo";
  /** true só quando o "9" foi acrescentado por nós (celular antigo de 8 dígitos). */
  nonoDigitoAdicionado: boolean;
};

/**
 * Normaliza um telefone brasileiro digitado em qualquer formato.
 * Nunca lança: devolve null quando não dá pra reconstruir um número discável.
 */
export function normalizarTelefoneBR(raw: unknown): TelefoneBR | null {
  try {
    if (typeof raw !== "string" && typeof raw !== "number") return null;

    // 1) só dígitos
    let d = String(raw).replace(/\D/g, "");
    if (d.length < 8 || d.length > 16) return null;

    // 2) não-geográficos: 0300 / 0500 / 0800 / 0900 não têm DDD e não existem no WhatsApp
    if (/^0[3589]00/.test(d)) return null;

    // 3) DDI. "00" = código de acesso internacional ("0055 ..."); nenhum DDD começa com 0,
    //    então esse prefixo é inequívoco. Depois corta "55" SÓ com 12+ dígitos: assim o
    //    DDD 55 (Santa Maria/RS) sobrevive — "55991452033" tem 11 e não é tocado.
    if (d.startsWith("00")) d = d.slice(2);
    if (d.startsWith("55") && d.length >= 12) d = d.slice(2);

    // 4) trunk 0 (o "0" de operadora). Vem DEPOIS do DDI para aceitar "+55 (011) ...".
    if (d.startsWith("0")) d = d.slice(1);

    // 5) tamanho nacional válido: DDD(2) + 8 ou 9
    if (d.length !== 10 && d.length !== 11) return null;

    const ddd = d.slice(0, 2);
    if (!DDDS_VALIDOS.has(ddd)) return null;

    let numero = d.slice(2);

    // 6) nono dígito
    let tipo: "celular" | "fixo";
    let nonoDigitoAdicionado = false;

    if (numero.length === 9) {
      // celular atual: obrigatoriamente começa com 9. Nunca vira 10 dígitos.
      if (numero[0] !== "9") return null;
      tipo = "celular";
    } else {
      const primeiro = numero[0];
      if (primeiro >= "6" && primeiro <= "9") {
        // celular antigo (6/7/8/9) — falta o nono dígito
        numero = `9${numero}`;
        tipo = "celular";
        nonoDigitoAdicionado = true;
      } else if (primeiro >= "2" && primeiro <= "5") {
        // FIXO — jamais recebe o 9
        tipo = "fixo";
      } else {
        return null; // assinante começando em 0 ou 1 não existe
      }
    }

    return { e164: `55${ddd}${numero}`, ddd, numero, tipo, nonoDigitoAdicionado };
  } catch {
    return null;
  }
}

/** "https://wa.me/5511988124477" ou null quando o telefone não é discável. */
export function linkWhatsApp(tel: unknown): string | null {
  const t = normalizarTelefoneBR(tel);
  return t ? `https://wa.me/${t.e164}` : null;
}

/** "(11) 98812-4477" — exibição do número já normalizado (usado no aviso do formulário). */
export function formatarTelefoneBR(t: TelefoneBR): string {
  const meio = t.numero.length === 9 ? t.numero.slice(0, 5) : t.numero.slice(0, 4);
  return `(${t.ddd}) ${meio}-${t.numero.slice(-4)}`;
}
