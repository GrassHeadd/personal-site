import { z } from "zod";

/* Request schema for POST /api/blog and PUT /api/blog/[id]. */
export const postBody = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().default(""),
  published: z.boolean().default(false),
});
