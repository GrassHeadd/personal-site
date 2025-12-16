import type { Post } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
  data: { title: string; slug: string; content: string },
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
  data: { title: string; slug: string; content: string; published: boolean },
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

export async function getPostById(apiKey: string, id: string): Promise<Post> {
  const res = await fetch(`${API_BASE}/v1/blog/${id}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

// Chat with AI - returns an EventSource for SSE streaming
export function chatStream(
  apiKey: string,
  data: {
    message: string;
    selectedText?: string;
    fullDraft?: string;
    history?: { role: string; content: string }[];
  },
  onChunk: (chunk: {
    Content: string;
    Done: boolean;
    Error?: string;
    Suggestion?: { Original: string; Rewritten: string };
  }) => void,
  onError: (error: string) => void,
): () => void {
  const controller = new AbortController();

  fetch(`${API_BASE}/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(data),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        onError("Failed to start chat");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onError("No response body");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonStr = line.slice(5).trim();
              const data = JSON.parse(jsonStr);
              onChunk(data);
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError(err.message);
      }
    });

  return () => controller.abort();
}
