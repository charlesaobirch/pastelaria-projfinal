/**
 * Formatação pt-PT num sítio só, para os ecrãs não inventarem separadores.
 * Valores inválidos (NaN/Infinity) aparecem como "—", nunca como "NaN".
 */

// `useGrouping: "always"` porque o pt-PT só agrupa a partir de 5 dígitos por
// omissão: sem isto, 3069,92 € aparecia como "3069,92 €" e o relatório diz
// "3 069,92 €".
const eurFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  useGrouping: "always",
});

const intFormatter = new Intl.NumberFormat("pt-PT", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

const pctFormatters = new Map<number, Intl.NumberFormat>();

function pctFormatter(decimals: number): Intl.NumberFormat {
  let formatter = pctFormatters.get(decimals);

  if (!formatter) {
    formatter = new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: "always",
    });
    pctFormatters.set(decimals, formatter);
  }

  return formatter;
}

/** `8319.78` → `"8 319,78 €"` */
export function eur(value: number): string {
  return Number.isFinite(value) ? eurFormatter.format(value) : "—";
}

/** `7643` → `"7 643"` */
export function int(value: number): string {
  return Number.isFinite(value) ? intFormatter.format(value) : "—";
}

/** `73.04` → `"73,0 %"` */
export function pct(value: number, decimals = 1): string {
  return Number.isFinite(value)
    ? `${pctFormatter(decimals).format(value)} %`
    : "—";
}
