import { sql } from "drizzle-orm";
import { boolean, check, date, pgTable, text, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";

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
    /* events outlive their todo: the calendar is a record of time */
    todoId: uuid("todo_id").references(() => todos.id, { onDelete: "set null" }),
    /* soft delete: rows are kept but hidden once stamped */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("events_color_check", sql`${t.color} in ('forest', 'amber')`)],
);

/* One scribble per calendar span. The hierarchy (day-in-week-in-month)
   is date math at read time, not foreign keys: anchor = the span's first
   day (day=itself, week=its sunday, month=the 1st, year=jan 1). */
export const periodNotes = pgTable(
  "period_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    anchor: date("anchor").notNull(),
    note: text("note").notNull(),
    /* future join key into the braindump/obsidian vault */
    braindumpRef: text("braindump_ref"),
    /* soft delete: rows are kept but hidden once stamped */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("period_notes_kind_check", sql`${t.kind} in ('day', 'week', 'month', 'year')`),
    unique("period_notes_kind_anchor").on(t.kind, t.anchor),
  ],
);

/* The admin-only braindump pad. noted_on is the day a scribble was
   written — the future mapping onto obsidian daily notes. */
export const scribbles = pgTable("scribbles", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  notedOn: date("noted_on").notNull(),
  /* soft delete: rows are kept but hidden once stamped */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  note: text("note"),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at", { withTimezone: true }),
  /* soft delete: rows are kept but hidden once stamped */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
