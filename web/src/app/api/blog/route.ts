import { sb, toGoPost, authorized, unauthorized, type PostRow } from "@/lib/talkerinos/db";

export async function GET() {
  const res = await sb("posts?published=eq.true&order=created_at.desc");
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const rows: PostRow[] = await res.json();
  return Response.json(rows.map(toGoPost));
}

export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.slug) {
    return Response.json({ err: "invalid request" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const res = await sb("posts", {
    method: "POST",
    body: JSON.stringify({
      id: crypto.randomUUID(),
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
      published: false,
      created_at: now,
      updated_at: now,
    }),
  });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const [row]: PostRow[] = await res.json();
  return Response.json(toGoPost(row), { status: 201 });
}
