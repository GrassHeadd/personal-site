import { serverError, unauthorized } from "@/shared/db";
import { badRequest, isUuid } from "@/shared/validation";
import { isAdmin } from "@/shared/auth";
import { removeEvent, replaceEvent } from "@/features/calendar/model";
import { eventBody } from "@/features/calendar/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  const body = eventBody.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  try {
    const row = await replaceEvent(id, body.data);
    if (!row) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(row);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    await removeEvent(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
