import { sb, toGoPost, type PostRow } from "@/lib/talkerinos/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const res = await sb(`posts?slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const rows: PostRow[] = await res.json();
  if (!rows.length) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(toGoPost(rows[0]));
}
