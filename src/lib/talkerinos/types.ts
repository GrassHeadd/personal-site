export interface Post {
  ID: string;
  Title: string;
  Slug: string;
  Content: string;
  Published: boolean;
  PublishedAt: { Time: string; Valid: boolean } | null;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  selectedText?: string;
}

export interface ChatResponseChunk {
  Content: string;
  Done: boolean;
  Error?: string;
  Suggestion?: {
    Original: string;
    Rewritten: string;
  };
}
