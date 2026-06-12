import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { removeEvent, replaceEvent } from "@/features/calendar/model";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.title?.trim() || !DATE_RE.test(body?.date ?? "")) {
    return Response.json({ error: "title and date (YYYY-MM-DD) required" }, { status: 400 });
  }

  try {
    const row = await replaceEvent(id, {
      date: body.date,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      color: body.color === "amber" ? "amber" : "forest",
    });
    if (!row) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(row);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    await removeEvent(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
