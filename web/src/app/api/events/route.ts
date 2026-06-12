import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { insertEvent, listEvents } from "@/features/calendar/model";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
    const row = await insertEvent({
      date: body.date,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      color: body.color === "amber" ? "amber" : "forest",
    });
    return Response.json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
