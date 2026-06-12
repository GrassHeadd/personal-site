import { authorized, serverError, unauthorized } from "@/shared/db";
import { listPosts } from "@/features/talkerinos/model";

export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();

  try {
    return Response.json(await listPosts(false));
  } catch (e) {
    return serverError(e);
  }
}
