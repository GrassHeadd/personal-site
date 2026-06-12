import "server-only";

import { sb } from "@/shared/db";

/* Data access for the blog (talkerinos). Functions return posts in the
   Go-era wire shape, or throw with the PostgREST message; auth and
   request validation stay in the route handlers. */

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

export async function listPosts(published: boolean): Promise<GoPost[]> {
  const res = await sb(`posts?published=eq.${published}&order=created_at.desc`);
  if (!res.ok) throw new Error(await res.text());
  const rows: PostRow[] = await res.json();
  return rows.map(toGoPost);
}

/* the get/replace/remove helpers return null when nothing matches */

export async function getPost(id: string): Promise<GoPost | null> {
  const res = await sb(`posts?id=eq.${id}&limit=1`);
  if (!res.ok) throw new Error(await res.text());
  const rows: PostRow[] = await res.json();
  return rows.length ? toGoPost(rows[0]) : null;
}

export async function getPostBySlug(slug: string): Promise<GoPost | null> {
  const res = await sb(`posts?slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if (!res.ok) throw new Error(await res.text());
  const rows: PostRow[] = await res.json();
  return rows.length ? toGoPost(rows[0]) : null;
}

export async function insertPost(input: {
  title: string;
  slug: string;
  content: string;
}): Promise<GoPost> {
  const now = new Date().toISOString();
  const res = await sb("posts", {
    method: "POST",
    body: JSON.stringify({
      id: crypto.randomUUID(),
      ...input,
      published: false,
      created_at: now,
      updated_at: now,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const [row]: PostRow[] = await res.json();
  return toGoPost(row);
}

export async function replacePost(
  id: string,
  input: { title: string; slug: string; content: string; published: boolean },
): Promise<GoPost | null> {
  const res = await sb(`posts?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...input, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(await res.text());
  const rows: PostRow[] = await res.json();
  return rows.length ? toGoPost(rows[0]) : null;
}

export async function removePost(id: string): Promise<void> {
  const res = await sb(`posts?id=eq.${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
