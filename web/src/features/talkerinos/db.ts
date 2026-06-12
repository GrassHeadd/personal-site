/* Server-side row shapes for the blog (talkerinos). */

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
