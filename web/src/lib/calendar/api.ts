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

export async function getEvents(from: string, to: string): Promise<CalEvent[]> {
  const res = await fetch(`/api/events?from=${from}&to=${to}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(
  apiKey: string,
  data: CalEventInput,
): Promise<CalEvent> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(
  apiKey: string,
  id: string,
  data: CalEventInput,
): Promise<CalEvent> {
  const res = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(apiKey: string, id: string): Promise<void> {
  const res = await fetch(`/api/events/${id}`, {
    method: "DELETE",
    headers: { "X-API-Key": apiKey },
  });
  if (!res.ok) throw new Error("Failed to delete event");
}
