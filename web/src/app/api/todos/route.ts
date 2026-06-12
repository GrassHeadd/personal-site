import { z } from "zod";
import { serverError, unauthorized } from "@/shared/db";
import { badRequest } from "@/shared/validation";
import { isAdmin } from "@/shared/auth";
import { insertTodo, listTodos } from "@/features/todos/model";

const todoBody = z.object({ title: z.string().trim().min(1) });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return Response.json(await listTodos());
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = todoBody.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  try {
    return Response.json(await insertTodo(body.data.title), { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
