import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { insertScribble, listScribbles } from "@/features/scribbles/model";

/* the braindump pad is admin-only, reads included */

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return Response.json(await listScribbles());
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const content = body?.content?.trim();
  if (!content) {
    return Response.json({ error: "content required" }, { status: 400 });
  }

  try {
    return Response.json(await insertScribble(content), { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
