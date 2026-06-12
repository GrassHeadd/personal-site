import "server-only";

import { sb } from "@/shared/db";
import type { Todo } from "./api";

/* Data access for todos. Functions take already-validated input and
   return rows, or throw with the PostgREST message; auth and request
   validation stay in the route handlers. */

/* apple-reminders style: every open item (writing order), but only the
   50 newest crossed-off ship to the page — older done rows stay in the db */
export async function listTodos(): Promise<Todo[]> {
  const [open, crossed] = await Promise.all([
    sb("todos?deleted_at=is.null&done=is.false&order=created_at.asc"),
    sb(
      "todos?deleted_at=is.null&done=is.true&order=done_at.desc.nullslast&limit=50",
    ),
  ]);
  if (!open.ok) throw new Error(await open.text());
  if (!crossed.ok) throw new Error(await crossed.text());
  return [...(await open.json()), ...(await crossed.json())];
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
  patch: { title?: string; note?: string | null; done?: boolean },
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

/* soft delete: stamp the todo only — its events stay on the calendar,
   which is a record of time, not a view of the todo list */
export async function removeTodo(id: string): Promise<void> {
  const now = new Date().toISOString();
  const res = await sb(`todos?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ deleted_at: now, updated_at: now }),
  });
  if (!res.ok) throw new Error(await res.text());
}
