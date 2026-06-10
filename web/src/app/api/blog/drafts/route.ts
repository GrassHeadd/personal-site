import { sb, toGoPost, authorized, unauthorized, type PostRow } from "@/lib/talkerinos/db";

export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();

  const res = await sb("posts?published=eq.false&order=created_at.desc");
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const rows: PostRow[] = await res.json();
  return Response.json(rows.map(toGoPost));
}
