export interface Todo {
  id: string;
  title: string;
  note: string | null;
  done: boolean;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

/* Writes are authorised by the admin session cookie, which the browser
   sends automatically on same-origin requests — no key to pass around. */

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(
  id: string,
  data: { title?: string; note?: string | null; done?: boolean },
): Promise<Todo> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");
}
