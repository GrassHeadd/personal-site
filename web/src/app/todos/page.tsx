"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import Squiggle from "@/shared/components/Squiggle";
import Footer from "@/shared/components/Footer";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  type Todo,
} from "@/features/todos/api";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const refetch = useCallback(() => {
    getTodos()
      .then((ts) => {
        setTodos(ts);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refetch();
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCanEdit(!!d.admin))
      .catch(() => {});
  }, [refetch]);

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
      <main className="max-w-2xl mx-auto px-6 pt-24 md:pt-28 min-h-screen">
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

        <div className="rise rise-3 sketch-border-soft bg-paper px-5 py-6 md:px-8">
          {!loaded ? (
            <p className="hand text-center text-ink-soft py-10">
              unfolding the list...
            </p>
          ) : (
            <>
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
                    className="group flex items-start gap-3 py-2.5 border-b border-dashed border-pencil last:border-b-0"
                  >
                    {checkbox(todo)}
                    <span className="hand text-lg leading-snug flex-1">{todo.title}</span>
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
            </>
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
