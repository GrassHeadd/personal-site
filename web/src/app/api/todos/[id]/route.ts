import { sb, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.title === "string") {
    if (!body.title.trim()) {
      return Response.json({ error: "title cannot be empty" }, { status: 400 });
    }
    patch.title = body.title.trim();
  }
  if (typeof body.done === "boolean") {
    patch.done = body.done;
    patch.done_at = body.done ? new Date().toISOString() : null;
  }

  const res = await sb(`todos?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
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
  const res = await sb(`todos?id=eq.${id}`, { method: "DELETE" });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
