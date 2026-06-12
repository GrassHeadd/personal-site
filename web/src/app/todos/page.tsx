import { isAdmin } from "@/shared/auth";
import { listEvents } from "@/features/calendar/model";
import { listTodos } from "@/features/todos/model";
import TodoList from "@/features/todos/TodoList";
import PrivatePage from "@/shared/components/PrivatePage";

/* Admin-only. Fetch the list and today's events server-side so the page
   arrives complete: no "unfolding the list..." flash. en-CA formats as
   YYYY-MM-DD in the calendar's timezone. */
export default async function TodosPage() {
  if (!(await isAdmin())) return <PrivatePage title="to-dos" />;

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.CALENDAR_TZ || "America/New_York",
  }).format(new Date());

  const [todos, todayEvents] = await Promise.all([
    listTodos().catch(() => null),
    listEvents({ from: today, to: today }).catch(() => []),
  ]);

  return (
    <TodoList
      initialTodos={todos}
      canEdit
      todayEvents={todayEvents}
      today={today}
    />
  );
}
