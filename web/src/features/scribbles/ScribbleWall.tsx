"use client";
import { useMemo, useState } from "react";
import Markdown from "react-markdown";

import Squiggle from "@/shared/components/Squiggle";
import Footer from "@/shared/components/Footer";
import {
  createScribble,
  deleteScribble,
  updateScribble,
  type Scribble,
} from "./api";

/* a little handmade unevenness, deterministic per position */
const TILTS = ["rotate-[0.35deg]", "-rotate-[0.3deg]", "rotate-[0.15deg]"];

export default function ScribbleWall({
  initialScribbles,
  today,
}: {
  initialScribbles: Scribble[] | null;
  today: string;
}) {
  const [scribbles, setScribbles] = useState<Scribble[]>(initialScribbles ?? []);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const loadError = initialScribbles === null;

  /* server order is noted_on desc, created_at desc — group preserving it */
  const groups = useMemo(() => {
    const out: { day: string; items: Scribble[] }[] = [];
    for (const s of scribbles) {
      const last = out[out.length - 1];
      if (last?.day === s.noted_on) last.items.push(s);
      else out.push({ day: s.noted_on, items: [s] });
    }
    return out;
  }, [scribbles]);

  const dayLabel = (day: string) =>
    day === today
      ? "today."
      : new Date(`${day}T12:00:00`)
          .toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
          .toLowerCase();

  const add = async () => {
    const content = draft.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      const row = await createScribble(content);
      /* newest first within today */
      setScribbles((ss) => [row, ...ss]);
      setDraft("");
    } catch {
      /* keep the draft so nothing typed is lost */
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s: Scribble) => {
    setEditingId(s.id);
    setEditDraft(s.content);
    setConfirmId(null);
  };

  /* optimistic edit; blank just closes the editor */
  const commitEdit = (s: Scribble) => {
    const content = editDraft.trim();
    setEditingId(null);
    if (!content || content === s.content) return;
    setScribbles((ss) =>
      ss.map((x) => (x.id === s.id ? { ...x, content } : x)),
    );
    updateScribble(s.id, content).catch(() => {
      setScribbles((ss) => ss.map((x) => (x.id === s.id ? s : x)));
    });
  };

  const remove = (s: Scribble) => {
    if (confirmId !== s.id) {
      setConfirmId(s.id);
      return;
    }
    setConfirmId(null);
    setScribbles((ss) => ss.filter((x) => x.id !== s.id));
    deleteScribble(s.id).catch(() => setScribbles((ss) => [s, ...ss]));
  };

  return (
    <>
      <main className="w-full max-w-4xl mx-auto px-6 pt-24 md:pt-28 flex-1">
        <h1 className="rise rise-1 text-3xl md:text-5xl font-bold mb-1">
          scribbles<span className="text-forest">.</span>
        </h1>
        <Squiggle className="w-44 md:w-60 h-3 mb-2" />
        <p className="rise rise-2 text-ink-soft max-w-xl mb-8">
          The braindump pad. Whatever's in the head goes here, filed under
          today.
        </p>

        {loadError && (
          <p className="hand text-amber text-sm mb-4" role="alert">
            couldn&apos;t load the pad. the thoughts are still in there somewhere.
          </p>
        )}

        {/* composer: always ready, always files under today */}
        <div className="rise rise-3 sketch-border-soft bg-paper p-4 mb-8">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add();
            }}
            placeholder="braindump something... (# headings, - lists, **bold**)"
            aria-label="new scribble"
            rows={5}
            className="hand text-lg w-full bg-transparent placeholder:text-pencil focus:outline-none resize-y min-h-28"
          />
          <div className="flex justify-end">
            <button
              onClick={add}
              disabled={saving || !draft.trim()}
              className="hand text-sm quiet-link cursor-pointer disabled:opacity-40 disabled:cursor-default"
            >
              {saving ? "jotting..." : "+ scribble"}
            </button>
          </div>
        </div>

        {groups.length === 0 && !loadError && (
          <p className="hand text-ink-soft">an empty head. enviable, honestly.</p>
        )}

        <div className="flex flex-col gap-8">
          {groups.map(({ day, items }) => (
            <section key={day}>
              <div className="section-head mb-3">
                <h2 className="!text-base text-ink-soft">{dayLabel(day)}</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {items.map((s, i) => (
                  <li
                    key={s.id}
                    className={`group sketch-border-soft bg-paper px-4 py-3 overflow-hidden ${TILTS[i % TILTS.length]}`}
                  >
                    {editingId === s.id ? (
                      /* editing shows the raw markdown */
                      <textarea
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onBlur={() => commitEdit(s)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.currentTarget.blur();
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        aria-label="edit scribble"
                        rows={Math.min(16, Math.max(3, editDraft.split("\n").length + 1))}
                        className="hand text-lg w-full bg-transparent focus:outline-none resize-y"
                      />
                    ) : (
                      <div className="flex items-start gap-2">
                        <div
                          onClick={() => startEdit(s)}
                          title="click to edit"
                          className="scribble-md flex-1 cursor-text min-w-0"
                        >
                          <Markdown>{s.content}</Markdown>
                        </div>
                        <button
                          onClick={() => remove(s)}
                          aria-label={`scrap scribble`}
                          className={`hand text-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer px-1 ${
                            confirmId === s.id
                              ? "text-amber font-bold opacity-100"
                              : "text-ink-soft hover:text-amber"
                          }`}
                        >
                          {confirmId === s.id ? "sure?" : "✕"}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="hand text-sm text-ink-soft mt-8 -rotate-[0.3deg]">
          ✏️ headed for the obsidian vault, someday. parked here for now.
        </p>
      </main>
      <Footer />
    </>
  );
}
