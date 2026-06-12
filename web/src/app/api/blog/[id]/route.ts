import { authorized, serverError, unauthorized } from "@/shared/db";
import { getPost, removePost, replacePost } from "@/features/talkerinos/model";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const post = await getPost(id);
    if (!post) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(post);
  } catch (e) {
    return serverError(e);
  }
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

  try {
    const post = await replacePost(id, {
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
      published: body.published ?? false,
    });
    if (!post) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(post);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  if (!authorized(req)) return unauthorized();

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await removePost(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
