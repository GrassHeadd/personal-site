import { sql } from "drizzle-orm";
import { check, date, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    title: text("title").notNull(),
    note: text("note"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    color: text("color").notNull().default("forest"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("events_color_check", sql`${t.color} in ('forest', 'amber')`)],
);
