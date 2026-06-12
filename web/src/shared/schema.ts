import { sql } from "drizzle-orm";
import { boolean, check, date, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    /* multi-day events run date..end_date inclusive */
    endDate: date("end_date"),
    title: text("title").notNull(),
    note: text("note"),
    color: text("color").notNull().default("forest"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    /* null | daily | weekly | monthly | yearly — expanded into occurrences at read time */
    recur: text("recur"),
    /* events spawned from a todo die with it */
    todoId: uuid("todo_id").references(() => todos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("events_color_check", sql`${t.color} in ('forest', 'amber')`)],
);

export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
