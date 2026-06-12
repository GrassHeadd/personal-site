import { isAdmin } from "@/shared/auth";
import { listTodos } from "@/features/todos/model";
import TodoList from "@/features/todos/TodoList";

/* Fetch the list and the session server-side so the page arrives complete:
   no "unfolding the list..." flash, no admin controls popping in late. */
export default async function TodosPage() {
  const [todos, canEdit] = await Promise.all([
    listTodos().catch(() => null),
    isAdmin(),
  ]);

  return <TodoList initialTodos={todos} canEdit={canEdit} />;
}
