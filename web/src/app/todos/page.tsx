import { isAdmin } from "@/shared/auth";
import { listEvents } from "@/features/calendar/model";
import { listTodos } from "@/features/todos/model";
import TodoList from "@/features/todos/TodoList";

/* Fetch the list, the session, and today's events server-side so the page
   arrives complete: no "unfolding the list..." flash, no admin controls
   popping in late. en-CA formats as YYYY-MM-DD in the calendar's timezone. */
export default async function TodosPage() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.CALENDAR_TZ || "America/New_York",
  }).format(new Date());

  const [todos, canEdit, todayEvents] = await Promise.all([
    listTodos().catch(() => null),
    isAdmin(),
    listEvents({ from: today, to: today }).catch(() => []),
  ]);

  return (
    <TodoList
      initialTodos={todos}
      canEdit={canEdit}
      todayEvents={todayEvents}
      today={today}
    />
  );
}
