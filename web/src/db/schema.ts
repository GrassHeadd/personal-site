import { sql } from "drizzle-orm";
import { check, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    title: text("title").notNull(),
    note: text("note"),
    color: text("color").notNull().default("forest"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("events_color_check", sql`${t.color} in ('forest', 'amber')`)],
);
