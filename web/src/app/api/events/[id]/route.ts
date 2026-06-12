import { sb, unauthorized } from "@/lib/talkerinos/db";
import { isAdmin } from "@/auth";

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

  const res = await sb(`events?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      date: body.date,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      color: body.color === "amber" ? "amber" : "forest",
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const rows = await res.json();
  if (!rows.length) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  const res = await sb(`events?id=eq.${id}`, { method: "DELETE" });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
