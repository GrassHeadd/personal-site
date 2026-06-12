import { authorized, serverError, unauthorized } from "@/shared/db";
import { insertPost, listPosts } from "@/features/talkerinos/model";

export async function GET() {
  try {
    return Response.json(await listPosts(true));
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.slug) {
    return Response.json({ err: "invalid request" }, { status: 400 });
  }

  try {
    const post = await insertPost({
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
    });
    return Response.json(post, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
