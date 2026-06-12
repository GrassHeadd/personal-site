import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { insertTodo, listTodos } from "@/features/todos/model";

export async function GET() {
  try {
    return Response.json(await listTodos());
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();
  if (!title) {
    return Response.json({ error: "title required" }, { status: 400 });
  }

  try {
    return Response.json(await insertTodo(title), { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
