import "server-only";

import { sb } from "@/shared/db";
import type { Todo } from "./api";

/* Data access for todos. Functions take already-validated input and
   return rows, or throw with the PostgREST message; auth and request
   validation stay in the route handlers. */

export async function listTodos(): Promise<Todo[]> {
  /* open items in writing order, crossed-off ones grouped after */
  const res = await sb("todos?deleted_at=is.null&order=done.asc,created_at.asc");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function insertTodo(title: string): Promise<Todo> {
  const res = await sb("todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await res.text());
  const [row] = await res.json();
  return row;
}

/* returns null when no row matches the id */
export async function patchTodo(
  id: string,
  patch: { title?: string; done?: boolean },
): Promise<Todo | null> {
  const row: Record<string, unknown> = {
    ...patch,
    updated_at: new Date().toISOString(),
  };
  if (typeof patch.done === "boolean") {
    row.done_at = patch.done ? new Date().toISOString() : null;
  }
  const res = await sb(`todos?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0] ?? null;
}

/* soft delete: stamp the todo, and its scheduled events go with it
   (the soft version of the FK cascade) */
export async function removeTodo(id: string): Promise<void> {
  const now = new Date().toISOString();
  const res = await sb(`todos?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ deleted_at: now, updated_at: now }),
  });
  if (!res.ok) throw new Error(await res.text());
  const ev = await sb(`events?todo_id=eq.${id}&deleted_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ deleted_at: now, updated_at: now }),
  });
  if (!ev.ok) throw new Error(await ev.text());
}
