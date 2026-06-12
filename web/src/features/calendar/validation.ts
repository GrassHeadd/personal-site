import { z } from "zod";
import { isoDate, uuid } from "@/shared/validation";
import type { EventInput } from "./model";

/* Request schema for POST /api/events and PUT /api/events/[id].
   Only title and date are hard requirements; a bad optional field
   falls back to null (matching the old hand-rolled coercion) rather
   than failing the whole request. */

/* "14:15" or "14:15:00" -> "14:15:00"; anything else -> null (all-day) */
const time = z.iso
  .time()
  .transform((v): string | null => v.slice(0, 5) + ":00")
  .catch(null);

export const eventBody = z
  .object({
    title: z.string().trim().min(1),
    date: isoDate,
    note: z
      .string()
      .trim()
      .transform((v): string | null => v || null)
      .catch(null),
    color: z.enum(["forest", "amber"]).catch("forest"),
    start_time: time,
    end_time: time,
    end_date: isoDate.nullable().catch(null),
    recur: z.enum(["daily", "weekly", "monthly", "yearly"]).nullable().catch(null),
    todo_id: uuid.nullable().catch(null),
  })
  .transform(
    (b): EventInput => ({
      ...b,
      /* an end only makes sense after a start */
      end_time:
        b.start_time && b.end_time && b.end_time > b.start_time ? b.end_time : null,
      /* a multi-day span must extend past its first day */
      end_date: b.end_date && b.end_date > b.date ? b.end_date : null,
    }),
  );

/* ?from=&to= on GET /api/events; an invalid date is treated as absent */
export const eventQuery = z.object({
  from: isoDate.optional().catch(undefined),
  to: isoDate.optional().catch(undefined),
});
