import { authorized, serverError, unauthorized } from "@/shared/db";
import { badRequest, isUuid } from "@/shared/validation";
import { getPost, removePost, replacePost } from "@/features/talkerinos/model";
import { postBody } from "@/features/talkerinos/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!isUuid(id)) {
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
  if (!isUuid(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = postBody.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  try {
    const post = await replacePost(id, body.data);
    if (!post) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(post);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  if (!authorized(req)) return unauthorized();

  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await removePost(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
