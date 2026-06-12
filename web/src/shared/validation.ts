import { z } from "zod";

/* Zod building blocks shared by the route handlers. */

export const uuid = z.uuid();
/* calendar date, YYYY-MM-DD */
export const isoDate = z.iso.date();

export const isUuid = (v: string) => uuid.safeParse(v).success;

/* 400 with a readable summary of what failed validation */
export const badRequest = (error: z.ZodError) =>
  Response.json({ error: z.prettifyError(error) }, { status: 400 });
