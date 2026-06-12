export type Recur = "daily" | "weekly" | "monthly" | "yearly";

export interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  note: string | null;
  color: "forest" | "amber";
  start_time: string | null; // HH:MM:SS
  end_time: string | null;
  end_date: string | null; // multi-day events run date..end_date inclusive
  recur: Recur | null;
  todo_id: string | null;
  /* set on expanded occurrences: the date the series row is stored under */
  series_date?: string;
}

export interface CalEventInput {
  date: string;
  title: string;
  note?: string;
  color: "forest" | "amber";
  start_time?: string | null;
  end_time?: string | null;
  end_date?: string | null;
  recur?: string | null;
  todo_id?: string | null;
}

/* Writes are authorised by the next-auth session cookie, which the browser
   sends automatically on same-origin requests — no key to pass around. */

export async function getEvents(from: string, to: string): Promise<CalEvent[]> {
  const res = await fetch(`/api/events?from=${from}&to=${to}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(data: CalEventInput): Promise<CalEvent> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(
  id: string,
  data: CalEventInput,
): Promise<CalEvent> {
  const res = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
}
