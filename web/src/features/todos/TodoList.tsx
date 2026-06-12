"use client";
import { useMemo, useState } from "react";

import Squiggle from "@/shared/components/Squiggle";
import Footer from "@/shared/components/Footer";
import { createTodo, deleteTodo, updateTodo, type Todo } from "@/features/todos/api";
import type { CalEvent } from "@/features/calendar/api";
import DayPanel from "@/features/todos/DayPanel";

/* The server page fetches the list, the session, and today's events, so the
   first paint already has everything — this component only handles
   interaction from there. initialTodos === null means the server couldn't
   load the list. */
export default function TodoList({
  initialTodos,
  canEdit,
  todayEvents = [],
  today = "",
}: {
  initialTodos: Todo[] | null;
  canEdit: boolean;
  todayEvents?: CalEvent[];
  today?: string;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos ?? []);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const loadError = initialTodos === null;

  /* todos that already have an event on today's panel get a small marker */
  const scheduledIds = useMemo(
    () =>
      new Set(
        todayEvents.map((e) => e.todo_id).filter((id): id is string => !!id),
      ),
    [todayEvents],
  );

  const open = useMemo(() => todos.filter((t) => !t.done), [todos]);
  const crossed = useMemo(
    () =>
      [...todos.filter((t) => t.done)].sort((a, b) =>
        (b.done_at ?? "").localeCompare(a.done_at ?? ""),
      ),
    [todos],
  );

  /* optimistic toggle: cross it off immediately, un-cross on failure */
  const toggle = (todo: Todo) => {
    if (!canEdit) return;
    const next = !todo.done;
    setTodos((ts) =>
      ts.map((t) =>
        t.id === todo.id
          ? { ...t, done: next, done_at: next ? new Date().toISOString() : null }
          : t,
      ),
    );
    updateTodo(todo.id, { done: next }).catch(() => {
      setTodos((ts) => ts.map((t) => (t.id === todo.id ? todo : t)));
    });
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title || saving) return;
    setSaving(true);
    try {
      const row = await createTodo(title);
      setTodos((ts) => [...ts, row]);
      setDraft("");
    } catch {
      /* keep the draft so nothing typed is lost */
    } finally {
      setSaving(false);
    }
  };

  const remove = (todo: Todo) => {
    setTodos((ts) => ts.filter((t) => t.id !== todo.id));
    deleteTodo(todo.id).catch(() => setTodos((ts) => [...ts, todo]));
  };

  const startEdit = (todo: Todo) => {
    if (!canEdit) return;
    setEditingId(todo.id);
    setEditDraft(todo.title);
  };

  /* optimistic rename: blank or unchanged input just closes the editor */
  const commitEdit = (todo: Todo) => {
    const title = editDraft.trim();
    setEditingId(null);
    if (!title || title === todo.title) return;
    setTodos((ts) => ts.map((t) => (t.id === todo.id ? { ...t, title } : t)));
    updateTodo(todo.id, { title }).catch(() => {
      setTodos((ts) => ts.map((t) => (t.id === todo.id ? todo : t)));
    });
  };

  const checkbox = (todo: Todo) => (
    <button
      onClick={() => toggle(todo)}
      disabled={!canEdit}
      aria-label={todo.done ? `un-cross "${todo.title}"` : `cross off "${todo.title}"`}
      className={`sketch-border shrink-0 size-6 mt-0.5 flex-center text-sm transition-transform duration-200 ${
        todo.done ? "!border-pencil text-forest" : "text-transparent"
      } ${canEdit ? "cursor-pointer hover:-rotate-6 hover:text-sage" : "cursor-default"}`}
    >
      <span className={todo.done ? "rotate-6" : ""}>✓</span>
    </button>
  );

  return (
    <>
      <main className="w-full max-w-4xl mx-auto px-6 pt-24 md:pt-28 flex-1">
        <h1 className="rise rise-1 text-3xl md:text-5xl font-bold mb-1">
          to-dos<span className="text-forest">.</span>
        </h1>
        <Squiggle className="w-40 md:w-56 h-3 mb-2" />
        <p className="rise rise-2 text-ink-soft max-w-xl mb-8">
          Things I&apos;ve promised myself I&apos;ll get to
          {canEdit ? ". Crossing them off is the best part." : ", in public, for accountability."}
        </p>

        {loadError && (
          <p className="hand text-amber text-sm mb-4" role="alert">
            couldn&apos;t load the list. it&apos;s probably under a coffee mug somewhere.
          </p>
        )}

        <div className="md:grid md:grid-cols-[1fr_18rem] md:gap-8 md:items-start">
        <div className="rise rise-3 sketch-border-soft bg-paper px-5 py-6 md:px-8">
          {open.length === 0 && !loadError && (
            <p className="hand text-ink-soft py-2">
              {crossed.length
                ? "all crossed off. suspiciously zen."
                : "nothing on the list yet."}
            </p>
          )}

          <ul className="flex flex-col">
            {open.map((todo) => (
              <li
                key={todo.id}
                /* the row drags onto the day panel; the title span still
                   owns click-to-rename (drag is suspended while editing) */
                draggable={canEdit && editingId !== todo.id}
                onDragStart={
                  canEdit
                    ? (e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({ id: todo.id, title: todo.title }),
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      }
                    : undefined
                }
                className="group flex items-start gap-3 py-2.5 border-b border-dashed border-pencil last:border-b-0"
              >
                {canEdit && (
                  <span
                    aria-hidden
                    title="drag onto today"
                    className="hand text-pencil select-none cursor-grab active:cursor-grabbing mt-0.5 -ml-1"
                  >
                    ⠿
                  </span>
                )}
                {checkbox(todo)}
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onBlur={() => commitEdit(todo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    aria-label={`edit "${todo.title}"`}
                    className="hand text-lg leading-snug flex-1 bg-transparent border-b border-dashed border-forest focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => startEdit(todo)}
                    {...(canEdit && {
                      role: "button",
                      tabIndex: 0,
                      onKeyDown: (e: React.KeyboardEvent) =>
                        e.key === "Enter" && startEdit(todo),
                      title: "click to edit",
                    })}
                    className={`hand text-lg leading-snug flex-1 ${canEdit ? "cursor-text" : ""}`}
                  >
                    {todo.title}
                  </span>
                )}
                {scheduledIds.has(todo.id) && (
                  <span
                    title="scheduled today"
                    className="text-xs mt-1 shrink-0"
                  >
                    📅
                  </span>
                )}
                {canEdit && (
                  <button
                    onClick={() => remove(todo)}
                    aria-label={`scrap "${todo.title}"`}
                    className="hand text-ink-soft opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-amber transition-opacity cursor-pointer px-1"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>

          {canEdit && (
            <form onSubmit={add} className="flex items-center gap-3 pt-4">
              <span className="sketch-dashed shrink-0 size-6" aria-hidden />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="write something down..."
                aria-label="new to-do"
                className="hand text-lg flex-1 bg-transparent placeholder:text-pencil focus:outline-none"
              />
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                className="hand text-sm quiet-link cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                {saving ? "jotting..." : "+ add"}
              </button>
            </form>
          )}

          {crossed.length > 0 && (
            <>
              <div className="section-head mt-8 mb-2">
                <h2 className="!text-base text-ink-soft">
                  crossed off <span className="text-forest">({crossed.length})</span>
                </h2>
              </div>
              <ul className="flex flex-col">
                {crossed.map((todo) => (
                  <li
                    key={todo.id}
                    className="group flex items-start gap-3 py-2 text-ink-soft"
                  >
                    {checkbox(todo)}
                    <span className="strike-wavy hand text-lg leading-snug flex-1 opacity-60">
                      {todo.title}
                    </span>
                    {scheduledIds.has(todo.id) && (
                      <span
                        title="scheduled today"
                        className="text-xs mt-1 shrink-0 opacity-60"
                      >
                        📅
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => remove(todo)}
                        aria-label={`scrap "${todo.title}"`}
                        className="hand opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-amber transition-opacity cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

          {today && (
            <div className="rise rise-3 mt-8 md:mt-0">
              <DayPanel events={todayEvents} today={today} canEdit={canEdit} />
            </div>
          )}
        </div>

        <p className="hand text-sm text-ink-soft mt-4 -rotate-[0.3deg]">
          ✏️ a list in public is a promise with witnesses.
        </p>
      </main>
      <Footer />
    </>
  );
}
