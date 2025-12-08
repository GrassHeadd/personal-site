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
