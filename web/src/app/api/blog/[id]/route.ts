import { sb, authorized, unauthorized } from "@/shared/db";
import { toGoPost, type PostRow } from "@/features/talkerinos/db";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const res = await sb(`posts?id=eq.${id}&limit=1`);
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const rows: PostRow[] = await res.json();
  if (!rows.length) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(toGoPost(rows[0]));
}

export async function PUT(req: Request, { params }: Params) {
  if (!authorized(req)) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.slug) {
    return Response.json({ err: "invalid request" }, { status: 400 });
  }

  const res = await sb(`posts?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
      published: body.published ?? false,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const rows: PostRow[] = await res.json();
  if (!rows.length) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(toGoPost(rows[0]));
}

export async function DELETE(req: Request, { params }: Params) {
  if (!authorized(req)) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const res = await sb(`posts?id=eq.${id}`, { method: "DELETE" });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
