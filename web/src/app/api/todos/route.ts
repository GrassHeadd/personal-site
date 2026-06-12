import { sb, unauthorized } from "@/lib/talkerinos/db";
import { isAdmin } from "@/auth";

export async function GET() {
  /* open items in writing order, crossed-off ones grouped after */
  const res = await sb("todos?order=done.asc,created_at.asc");
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  return Response.json(await res.json());
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();
  if (!title) {
    return Response.json({ error: "title required" }, { status: 400 });
  }

  const res = await sb("todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const [row] = await res.json();
  return Response.json(row, { status: 201 });
}
