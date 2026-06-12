import "server-only";

import { sb } from "@/shared/db";
import type { CalEvent, PeriodNote } from "./api";
import { expandEvents } from "./expand";

/* Data access for calendar events. Functions take already-validated
   input and return rows, or throw with the PostgREST message; auth and
   request validation stay in the route handlers. */

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/* "14:15" or "14:15:00" -> "14:15:00"; anything else -> null (all-day) */
export const parseTime = (v: unknown): string | null =>
  typeof v === "string" && TIME_RE.test(v) ? v.slice(0, 5) + ":00" : null;

export interface EventInput {
  date: string;
  title: string;
  note: string | null;
  color: "forest" | "amber";
  start_time: string | null;
  /* omitted = leave untouched (feed-synced events carry an end time) */
  end_time?: string | null;
  end_date: string | null;
  recur: string | null;
  todo_id?: string | null;
}

export async function listEvents(
  range: { from?: string; to?: string } = {},
): Promise<CalEvent[]> {
  const { from, to } = range;

  if (from && to) {
    /* with a window we can expand recurring series and multi-day spans:
       singles overlapping the window, plus every series started by `to` */
    const [singles, series] = await Promise.all([
      sb(
        `events?deleted_at=is.null&recur=is.null&date=lte.${to}&or=(end_date.gte.${from},date.gte.${from})&order=date.asc`,
      ),
      sb(`events?deleted_at=is.null&recur=not.is.null&date=lte.${to}&order=date.asc`),
    ]);
    if (!singles.ok) throw new Error(await singles.text());
    if (!series.ok) throw new Error(await series.text());
    return expandEvents(
      [...(await singles.json()), ...(await series.json())],
      from,
      to,
    );
  }

  /* all-day events first, then timed ones in clock order */
  let q = "events?deleted_at=is.null&order=date.asc,start_time.asc.nullsfirst,created_at.asc";
  if (from) q += `&date=gte.${from}`;
  if (to) q += `&date=lte.${to}`;
  const res = await sb(q);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function insertEvent(input: EventInput): Promise<CalEvent> {
  const res = await sb("events", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const [row] = await res.json();
  return row;
}

/* returns null when no row matches the id */
export async function replaceEvent(
  id: string,
  input: EventInput,
): Promise<CalEvent | null> {
  const res = await sb(`events?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...input, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0] ?? null;
}

/* soft delete: stamp the row instead of dropping it */
export async function removeEvent(id: string): Promise<void> {
  const now = new Date().toISOString();
  const res = await sb(`events?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ deleted_at: now, updated_at: now }),
  });
  if (!res.ok) throw new Error(await res.text());
}

/* ── period notes ─────────────────────────────────────────────────── */

const shiftDays = (ymd: string, n: number) => {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/* Notes whose span could touch the window. The hierarchy is date math:
   a week note's anchor can sit up to 6 days before `from`, a month's at
   the 1st, a year's at jan 1 — no foreign keys needed. */
export async function listNotes(from: string, to: string): Promise<PeriodNote[]> {
  const q =
    `period_notes?deleted_at=is.null&or=(` +
    `and(kind.eq.day,anchor.gte.${from},anchor.lte.${to}),` +
    `and(kind.eq.week,anchor.gte.${shiftDays(from, -6)},anchor.lte.${to}),` +
    `and(kind.eq.month,anchor.gte.${from.slice(0, 7)}-01,anchor.lte.${to}),` +
    `and(kind.eq.year,anchor.gte.${from.slice(0, 4)}-01-01,anchor.lte.${to})` +
    `)&order=anchor.asc`;
  const res = await sb(q);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* one note per (kind, anchor): writes are upserts, and writing over a
   soft-deleted note resurrects it */
export async function upsertNote(input: {
  kind: string;
  anchor: string;
  note: string;
  braindump_ref: string | null;
}): Promise<PeriodNote> {
  const res = await sb("period_notes?on_conflict=kind,anchor", {
    method: "POST",
    headers: {
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify({
      ...input,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const [row] = await res.json();
  return row;
}

export async function removeNote(kind: string, anchor: string): Promise<void> {
  const now = new Date().toISOString();
  const res = await sb(`period_notes?kind=eq.${kind}&anchor=eq.${anchor}`, {
    method: "PATCH",
    body: JSON.stringify({ deleted_at: now, updated_at: now }),
  });
  if (!res.ok) throw new Error(await res.text());
}
