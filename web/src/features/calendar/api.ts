export interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  note: string | null;
  color: "forest" | "amber";
}

export interface CalEventInput {
  date: string;
  title: string;
  note?: string;
  color: "forest" | "amber";
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
