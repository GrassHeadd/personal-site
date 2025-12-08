import type { Post } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/v1/blog`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const res = await fetch(`${API_BASE}/v1/blog/slug/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

export async function getDrafts(apiKey: string): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/v1/blog/drafts`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch drafts");
  return res.json();
}

export async function createPost(
  apiKey: string,
  data: { title: string; slug: string; content: string }
): Promise<Post> {
  const res = await fetch(`${API_BASE}/v1/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

export async function updatePost(
  apiKey: string,
  id: string,
  data: { title: string; slug: string; content: string; published: boolean }
): Promise<Post> {
  const res = await fetch(`${API_BASE}/v1/blog/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

export async function deletePost(apiKey: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/blog/${id}`, {
    method: "DELETE",
    headers: { "X-API-Key": apiKey },
  });
  if (!res.ok) throw new Error("Failed to delete post");
}
