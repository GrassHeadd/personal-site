import "server-only";

import { sb } from "@/shared/db";
import type { Scribble } from "./api";

/* Data access for the braindump pad. Admin-only feature: the routes
   gate every verb, including reads. */

/* the calendar's idea of "today", not the server's UTC clock */
export const todayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.CALENDAR_TZ || "America/New_York",
  }).format(new Date());

export async function listScribbles(): Promise<Scribble[]> {
  const res = await sb(
    "scribbles?deleted_at=is.null&order=noted_on.desc,created_at.desc",
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* new scribbles auto-file under today */
export async function insertScribble(content: string): Promise<Scribble> {
  const res = await sb("scribbles", {
    method: "POST",
    body: JSON.stringify({ content, noted_on: todayKey() }),
  });
  if (!res.ok) throw new Error(await res.text());
  const [row] = await res.json();
  return row;
}

/* returns null when no row matches the id */
export async function patchScribble(
  id: string,
  content: string,
): Promise<Scribble | null> {
  const res = await sb(`scribbles?id=eq.${id}&deleted_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ content, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0] ?? null;
}

/* soft delete: stamp the row instead of dropping it */
export async function removeScribble(id: string): Promise<void> {
  const now = new Date().toISOString();
  const res = await sb(`scribbles?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ deleted_at: now, updated_at: now }),
  });
  if (!res.ok) throw new Error(await res.text());
}
