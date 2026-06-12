import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { insertEvent, listEvents, parseTime } from "@/features/calendar/model";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RECURS = ["daily", "weekly", "monthly", "yearly"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    return Response.json(
      await listEvents({
        from: from && DATE_RE.test(from) ? from : undefined,
        to: to && DATE_RE.test(to) ? to : undefined,
      }),
    );
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.title?.trim() || !DATE_RE.test(body?.date ?? "")) {
    return Response.json({ error: "title and date (YYYY-MM-DD) required" }, { status: 400 });
  }

  try {
    const start = parseTime(body.start_time);
    const end = parseTime(body.end_time);
    const row = await insertEvent({
      date: body.date,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      color: body.color === "amber" ? "amber" : "forest",
      start_time: start,
      /* an end only makes sense after a start */
      end_time: start && end && end > start ? end : null,
      end_date:
        typeof body.end_date === "string" &&
        DATE_RE.test(body.end_date) &&
        body.end_date > body.date
          ? body.end_date
          : null,
      recur: RECURS.includes(body.recur) ? body.recur : null,
      todo_id:
        typeof body.todo_id === "string" && UUID_RE.test(body.todo_id)
          ? body.todo_id
          : null,
    });
    return Response.json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
