import { isAdmin } from "@/shared/auth";
import { sb } from "@/shared/db";
import TodoList from "@/features/todos/TodoList";
import type { Todo } from "@/features/todos/api";

/* Fetch the list and the session server-side so the page arrives complete:
   no "unfolding the list..." flash, no admin controls popping in late. */
export default async function TodosPage() {
  const [todos, canEdit] = await Promise.all([
    sb("todos?order=done.asc,created_at.asc")
      .then((res) => (res.ok ? (res.json() as Promise<Todo[]>) : null))
      .catch(() => null),
    isAdmin(),
  ]);

  return <TodoList initialTodos={todos} canEdit={canEdit} />;
}
