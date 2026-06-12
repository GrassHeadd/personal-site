import "server-only";

import { sb } from "@/shared/db";
import type { CalEvent } from "./api";

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
}

export async function listEvents(
  range: { from?: string; to?: string } = {},
): Promise<CalEvent[]> {
  /* all-day events first, then timed ones in clock order */
  let q = "events?order=date.asc,start_time.asc.nullsfirst,created_at.asc";
  if (range.from) q += `&date=gte.${range.from}`;
  if (range.to) q += `&date=lte.${range.to}`;
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

export async function removeEvent(id: string): Promise<void> {
  const res = await sb(`events?id=eq.${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
