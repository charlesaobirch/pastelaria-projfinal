/**
 * Datas do projeto.
 *
 * As vendas trazem `date` como texto `"YYYY-MM-DD"`. Comparar e ordenar pode
 * ser feito sobre a string; só para agrupar por mês/dia da semana é preciso um
 * `Date`. E esse `Date` é construído à mão: `new Date("2025-11-01")` é meia-noite
 * UTC e, num fuso negativo, o dia anterior.
 */

import type { SalesFilters } from "@/types";

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const WEEKDAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEKDAYS_LONG = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

/** `"2025-11-01"` → data local à meia-noite. */
export function parseDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Data local → `"2025-11-01"`. */
export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Chave de agrupamento mensal, ex. `"2026-07"`. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** `"2026-07"` → `"Jul/26"`, para eixos de gráficos. */
export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS_SHORT[month - 1]}/${String(year).slice(2)}`;
}

/** 0 = segunda … 6 = domingo (o `getDay()` do JS começa no domingo). */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function weekdayLabel(index: number, short = true): string {
  return (short ? WEEKDAYS_SHORT : WEEKDAYS_LONG)[index];
}

/**
 * Intervalo dos últimos `days` dias, contado a partir da venda **mais
 * recente** e não de hoje — o conjunto de dados termina em 2026-10-31, por isso
 * "últimos 30 dias" a contar de hoje viria vazio.
 */
export function lastNDays(
  dates: string[],
  days: number,
): Pick<SalesFilters, "from" | "to"> {
  if (dates.length === 0) {
    return { from: null, to: null };
  }

  const to = dates.reduce((max, date) => (date > max ? date : max));
  const from = parseDate(to);
  from.setDate(from.getDate() - (days - 1));

  return { from: toISODate(from), to };
}

/** Data mais antiga e mais recente do conjunto, para mostrar o período. */
export function dataRange(dates: string[]): {
  from: string | null;
  to: string | null;
} {
  if (dates.length === 0) {
    return { from: null, to: null };
  }

  return {
    from: dates.reduce((min, date) => (date < min ? date : min)),
    to: dates.reduce((max, date) => (date > max ? date : max)),
  };
}

/*
 * Intervalos para o selector de período.
 *
 * Nota: o conjunto cobre 12 meses, mas não dois anos civis — 2025 só tem
 * novembro e dezembro, 2026 só tem janeiro a outubro. `yearRange(2025)` é
 * válido, mas devolve apenas 61 dias com vendas: comparações entre anos têm de
 * ser normalizadas por dia, nunca por total.
 */

/** Ano civil completo: `2026` → `2026-01-01` … `2026-12-31`. */
export function yearRange(year: number): { from: string; to: string } {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

/** Mês a partir da chave de `revenueByMonth`: `"2026-07"` → `…-01` … `…-31`. */
export function monthRange(month: string): { from: string; to: string } {
  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(year, monthIndex, 0);
  return { from: `${month}-01`, to: toISODate(lastDay) };
}

/** Um único dia: `"2026-10-14"` → from e to iguais. */
export function dayRange(date: string): { from: string; to: string } {
  return { from: date, to: date };
}
