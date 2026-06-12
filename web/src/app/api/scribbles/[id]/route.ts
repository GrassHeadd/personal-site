import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { patchScribble, removeScribble } from "@/features/scribbles/model";

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
  const content = body?.content?.trim();
  if (!content) {
    return Response.json({ error: "content required" }, { status: 400 });
  }

  try {
    const row = await patchScribble(id, content);
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
    await removeScribble(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
