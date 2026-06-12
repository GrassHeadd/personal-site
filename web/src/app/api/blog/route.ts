import { authorized, serverError, unauthorized } from "@/shared/db";
import { badRequest } from "@/shared/validation";
import { insertPost, listPosts } from "@/features/talkerinos/model";
import { postBody } from "@/features/talkerinos/validation";

export async function GET() {
  try {
    return Response.json(await listPosts(true));
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();

  const body = postBody.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  try {
    const { title, slug, content } = body.data;
    const post = await insertPost({ title, slug, content });
    return Response.json(post, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
