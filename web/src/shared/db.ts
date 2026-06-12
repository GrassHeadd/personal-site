/* Server-side Supabase access. Uses PostgREST over fetch —
   no client lib needed. Service role key: NEVER import this from client code. */

export async function sb(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = process.env.SUPABASE_URL;
  /* prefer the secret (service role) key; fall back to the publishable key,
     which works while RLS is disabled on the posts table */
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
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

/* 500 wrapper for errors thrown by the feature models */
export const serverError = (e: unknown) =>
  Response.json(
    { error: e instanceof Error ? e.message : "internal error" },
    { status: 500 },
  );
