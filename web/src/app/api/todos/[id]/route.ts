import { z } from "zod";
import { serverError, unauthorized } from "@/shared/db";
import { badRequest, isUuid } from "@/shared/validation";
import { isAdmin } from "@/shared/auth";
import { patchTodo, removeTodo } from "@/features/todos/model";

type Params = { params: Promise<{ id: string }> };

const todoPatch = z.object({
  title: z.string().trim().min(1).optional(),
  done: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  const body = todoPatch.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  try {
    const row = await patchTodo(id, body.data);
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
    await removeTodo(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
