import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { patchTodo, removeTodo } from "@/features/todos/model";

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

  const patch: { title?: string; done?: boolean } = {};
  if (typeof body.title === "string") {
    if (!body.title.trim()) {
      return Response.json({ error: "title cannot be empty" }, { status: 400 });
    }
    patch.title = body.title.trim();
  }
  if (typeof body.done === "boolean") patch.done = body.done;

  try {
    const row = await patchTodo(id, patch);
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
    await removeTodo(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
