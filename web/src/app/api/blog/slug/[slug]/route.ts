import { serverError } from "@/shared/db";
import { getPostBySlug } from "@/features/talkerinos/model";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(post);
  } catch (e) {
    return serverError(e);
  }
}
