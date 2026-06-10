/* Server-side Supabase access for the blog. Uses PostgREST over fetch —
   no client lib needed. Service role key: NEVER import this from client code. */

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/* The Go API serialized sqlc structs (capitalized fields, sql.NullTime).
   The admin UI and public pages still expect that shape. */
export interface GoPost {
  ID: string;
  Title: string;
  Slug: string;
  Content: string;
  Published: boolean;
  PublishedAt: { Time: string; Valid: boolean };
  CreatedAt: string;
  UpdatedAt: string;
}

export function toGoPost(r: PostRow): GoPost {
  return {
    ID: r.id,
    Title: r.title,
    Slug: r.slug,
    Content: r.content,
    Published: r.published,
    PublishedAt: r.published_at
      ? { Time: r.published_at, Valid: true }
      : { Time: "0001-01-01T00:00:00Z", Valid: false },
    CreatedAt: r.created_at,
    UpdatedAt: r.updated_at,
  };
}

export async function sb(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
    cache: "no-store",
  });
}

export function authorized(req: Request): boolean {
  const key = req.headers.get("X-API-Key");
  return !!key && key === process.env.BLOG_API_KEY;
}

export const unauthorized = () =>
  Response.json({ error: "Unauthorised" }, { status: 401 });
