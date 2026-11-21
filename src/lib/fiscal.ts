/** Janelas fiscais do conjunto de dados (Nov/25 a Out/26). */
import { parseDate } from "@/lib/dates";

export const FY2026 = {
  from: "2026-02-01",
  to: "2026-10-31",
  label: "2026 · Fev–Out",
} as const;

export const FY2025 = {
  from: "2025-11-01",
  to: "2026-01-31",
  label: "2025 · Nov–Jan",
} as const;

function shortMonth(data: Date): string {
  const mes = new Intl.DateTimeFormat("pt-PT", { month: "short" })
    .format(data)
    .replace(".", "");
  return mes.charAt(0).toUpperCase() + mes.slice(1);
}

/** `"2026-02-01"` → `"Fev 2026"`. */
export function monthYearLabel(iso: string): string {
  const data = parseDate(iso);
  return `${shortMonth(data)} ${data.getFullYear()}`;
}

/** `"2026-10-31"` → `"31 Out 2026"`. */
export function shortDateLabel(iso: string): string {
  const data = parseDate(iso);
  return `${data.getDate()} ${shortMonth(data)} ${data.getFullYear()}`;
}

/** `"2026-02-01"`, `"2026-10-31"` → `"Fev 2026 – Out 2026"`. */
export function fiscalRangeLabel(from: string, to: string): string {
  return `${monthYearLabel(from)} – ${monthYearLabel(to)}`;
}
