import type { CalEvent } from "./api";

/* Pure expansion of stored event rows into per-day occurrences for a
   [from, to] window. Recurring rows become one copy per occurrence-day;
   multi-day rows (end_date) become one copy per covered day. Kept free of
   "server-only" so tests can import it. */

export type EventRow = CalEvent; // rows come from PostgREST with the same shape

const DAY_MS = 86_400_000;

/* parse "YYYY-MM-DD" at noon UTC — noon keeps day arithmetic DST-proof */
const toMs = (d: string): number => {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day, 12);
};

const toStr = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

const addDays = (d: string, n: number): string => toStr(toMs(d) + n * DAY_MS);

/* days from a to b (positive when b is later) */
const diffDays = (a: string, b: string): number =>
  Math.round((toMs(b) - toMs(a)) / DAY_MS);

/* all-day entries sort before timed ones */
const cmpTime = (a: string | null, b: string | null): number => {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a < b ? -1 : 1;
};

const createdAt = (e: EventRow): string =>
  (e as { created_at?: string }).created_at ?? "";

export function expandEvents(
  rows: EventRow[],
  from: string,
  to: string,
): CalEvent[] {
  const out: CalEvent[] = [];

  for (const row of rows) {
    /* a multi-day event covers date..end_date inclusive */
    const span = row.end_date ? Math.max(0, diffDays(row.date, row.end_date)) : 0;

    /* copy the occurrence starting at S into the window, one row per day */
    const emit = (s: string) => {
      const lo = s > from ? s : from;
      const last = addDays(s, span);
      const hi = last < to ? last : to;
      for (let d = lo; d <= hi; d = addDays(d, 1)) {
        out.push({ ...row, date: d, series_date: row.date });
      }
    };

    if (!row.recur) {
      emit(row.date);
    } else if (row.recur === "daily" || row.recur === "weekly") {
      const step = row.recur === "daily" ? 1 : 7;
      /* fast-forward to the first occurrence whose span can still reach
         `from` — arithmetic, not a day-by-day walk from the series start */
      const behind = diffDays(row.date, from) - span;
      const k = behind > 0 ? Math.ceil(behind / step) : 0;
      for (let s = addDays(row.date, k * step); s <= to; s = addDays(s, step)) {
        emit(s);
      }
    } else if (row.recur === "monthly" || row.recur === "yearly") {
      /* keep the series' day-of-month (and month, for yearly); skip months
         where that day doesn't exist (31st, feb 29) */
      const [y0, m0, d0] = row.date.split("-").map(Number);
      for (let i = 0; i < 600; i++) {
        const y = row.recur === "yearly" ? y0 + i : y0 + Math.floor((m0 - 1 + i) / 12);
        const m = row.recur === "yearly" ? m0 : ((m0 - 1 + i) % 12) + 1;
        const ms = Date.UTC(y, m - 1, d0, 12);
        if (new Date(ms).getUTCDate() !== d0) continue; // day rolled over: skip
        const s = toStr(ms);
        if (s > to) break;
        emit(s);
      }
    }
  }

  return out.sort(
    (a, b) =>
      (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) ||
      cmpTime(a.start_time, b.start_time) ||
      (createdAt(a) < createdAt(b) ? -1 : createdAt(a) > createdAt(b) ? 1 : 0),
  );
}
