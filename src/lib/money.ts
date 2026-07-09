// Dinheiro em CENTAVOS (Int) — fonte da verdade para comparar/ordenar preços.
// O SQLite não tem decimal real (frações viram double), então guardamos centavos
// inteiros e só dividimos por 100 na hora de exibir/preencher input.

/**
 * Converte o que o usuário digita em CENTAVOS (inteiro), aceitando pt-BR e US:
 *   "150"        -> 15000
 *   "150,00"     -> 15000
 *   "1.250,50"   -> 125050   (ponto = milhar, vírgula = decimal)
 *   "1250.50"    -> 125050   (fallback US: ponto decimal)
 *   "R$ 1.250,5" -> 125050
 *   "1.250"      -> 125000   (separador único + 3 dígitos = milhar, não decimal)
 * Retorna null se não houver número válido.
 */
export function parseValorParaCentavos(
  raw: string | number | null | undefined,
): number | null {
  if (raw === null || raw === undefined) return null;

  let s = String(raw).trim().replace(/[^\d.,-]/g, "");
  if (s === "" || s === "-") return null;

  const negativo = s.startsWith("-");
  s = s.replace(/-/g, "");

  const ultimaVirgula = s.lastIndexOf(",");
  const ultimoPonto = s.lastIndexOf(".");
  const posDecimal = Math.max(ultimaVirgula, ultimoPonto);

  let canonico: string;
  if (posDecimal === -1) {
    canonico = s.replace(/\D/g, "");
  } else {
    const digitosDepois = s.slice(posDecimal + 1).replace(/\D/g, "");
    const soUmSeparador = ultimaVirgula === -1 || ultimoPonto === -1;
    if (soUmSeparador && digitosDepois.length === 3) {
      canonico = s.replace(/\D/g, ""); // "1.250" = milhar
    } else {
      const inteiros = s.slice(0, posDecimal).replace(/\D/g, "") || "0";
      canonico = `${inteiros}.${digitosDepois}`;
    }
  }
  if (canonico === "" || canonico === ".") return null;

  const reais = Number(canonico);
  if (!Number.isFinite(reais)) return null;

  const centavos = Math.round(reais * 100);
  return negativo ? -centavos : centavos;
}

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Centavos -> "R$ 1.250,50" (exibição). */
export function formatarBRL(centavos: number): string {
  return fmtBRL.format(centavos / 100);
}

/** Centavos -> "1250,50" para popular o input do form na edição (sem "R$"). */
export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}
