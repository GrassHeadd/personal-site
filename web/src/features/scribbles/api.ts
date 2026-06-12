export interface Scribble {
  id: string;
  content: string;
  noted_on: string; // YYYY-MM-DD, the day it was written
  created_at: string;
  updated_at: string;
}

/* Admin-only: every call rides on the session cookie, and the API
   401s without it — visitors never see this feature at all. */

export async function createScribble(content: string): Promise<Scribble> {
  const res = await fetch("/api/scribbles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to create scribble");
  return res.json();
}

export async function updateScribble(
  id: string,
  content: string,
): Promise<Scribble> {
  const res = await fetch(`/api/scribbles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update scribble");
  return res.json();
}

export async function deleteScribble(id: string): Promise<void> {
  const res = await fetch(`/api/scribbles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete scribble");
}
