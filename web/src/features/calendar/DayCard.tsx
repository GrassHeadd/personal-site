"use client";
import { useEffect, useState } from "react";

import {
  createEvent,
  updateEvent,
  deleteEvent,
  type CalEvent,
  type Recur,
} from "@/features/calendar/api";
import TimeWheel from "./TimeWheel";
import { fmtTime, plusOneHour } from "./time";

const SHORT_MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/* "2026-06-15" -> "jun 15", straight off the string so no timezone drama */
const fmtShortDate = (ymd: string) =>
  `${SHORT_MONTHS[Number(ymd.slice(5, 7)) - 1]} ${Number(ymd.slice(8, 10))}`;

const RECUR_CHOICES = ["once", "daily", "weekly", "monthly", "yearly"] as const;

interface DayCardProps {
  dateKey: string; // YYYY-MM-DD
  events: CalEvent[];
  canEdit: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const emptyForm = {
  title: "",
  note: "",
  color: "forest" as "forest" | "amber",
  start: null as string | null,
  end: null as string | null,
  endDate: null as string | null,
  recur: null as Recur | null,
  /* carried through edits, never rendered as inputs */
  seriesDate: null as string | null,
  todoId: null as string | null,
};

const DayCard = ({ dateKey, events, canEdit, onClose, onChanged }: DayCardProps) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const prettyDate = new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const startEdit = (ev: CalEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      note: ev.note ?? "",
      color: ev.color,
      start: ev.start_time,
      end: ev.end_time,
      endDate: ev.end_date,
      recur: ev.recur,
      seriesDate: ev.series_date ?? ev.date,
      todoId: ev.todo_id,
    });
    setConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !form.title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = {
        /* edits must keep the series anchored to its true start date */
        date: editingId ? (form.seriesDate ?? dateKey) : dateKey,
        title: form.title,
        note: form.note,
        color: form.color,
        start_time: form.start,
        end_time: form.start ? form.end : null,
        end_date: form.endDate,
        recur: form.recur,
        todo_id: form.todoId,
      };
      if (editingId) {
        await updateEvent(editingId, data);
      } else {
        await createEvent(data);
      }
      cancelEdit();
      onChanged();
    } catch {
      setError("that didn't save, try again");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteEvent(id);
      setConfirmId(null);
      if (editingId === id) cancelEdit();
      onChanged();
    } catch {
      setError("couldn't delete that");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/25 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="sketch-border bg-paper w-full max-w-md min-h-[24rem] max-h-[85vh] overflow-y-auto p-6 md:p-8 -rotate-[0.5deg] shadow-[4px_6px_0_rgba(51,48,42,0.08)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={prettyDate}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="text-xl md:text-2xl font-bold lowercase">{prettyDate}</h2>
          <button
            onClick={onClose}
            className="hand text-ink-soft hover:text-forest text-xl leading-none cursor-pointer"
            aria-label="close"
          >
            ×
          </button>
        </div>
        <div className="border-t border-dashed border-pencil mb-4" />

        {events.length === 0 ? (
          <p className="text-ink-soft text-sm">nothing scribbled for this day.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 size-2.5 rounded-full shrink-0 ${
                    ev.color === "amber" ? "bg-amber" : "bg-forest"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="hand font-bold leading-snug">
                    {ev.start_time && (
                      <span className="text-forest text-sm font-bold mr-1.5">
                        {fmtTime(ev.start_time)}
                        {ev.end_time && `–${fmtTime(ev.end_time)}`}
                      </span>
                    )}
                    {ev.title}
                    {ev.recur && (
                      <span
                        className="text-ink-soft text-sm ml-1.5"
                        title={`repeats ${ev.recur}`}
                      >
                        ↻
                      </span>
                    )}
                    {ev.end_date && (
                      <span className="text-ink-soft text-sm ml-1.5">
                        → {fmtShortDate(ev.end_date)}
                      </span>
                    )}
                  </p>
                  {ev.note && (
                    <p className="text-ink-soft text-sm leading-snug">{ev.note}</p>
                  )}
                </div>
                {canEdit && (
                  <span className="flex gap-2 shrink-0 text-sm">
                    <button
                      onClick={() => startEdit(ev)}
                      className="hand text-ink-soft hover:text-forest cursor-pointer"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={busy}
                      className={`hand cursor-pointer ${
                        confirmId === ev.id
                          ? "text-amber font-bold"
                          : "text-ink-soft hover:text-amber"
                      }`}
                    >
                      {confirmId === ev.id ? "sure?" : "delete"}
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {!canEdit && (
          <p className="hand text-xs text-ink-soft/70 mt-6 pt-4 border-t border-dashed border-pencil">
            jj scribbles in here after whispering the magic word.
          </p>
        )}

        {canEdit && (
          <form onSubmit={handleSubmit} className="mt-6 pt-4 border-t border-dashed border-pencil flex flex-col gap-2.5">
            <p className="hand text-sm font-bold text-ink-soft">
              {editingId ? "edit event ✏️" : "scribble something in ✏️"}
            </p>
            {editingId && form.recur && (
              <p className="hand text-xs text-ink-soft">
                ↻ edits apply to every repeat
              </p>
            )}
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="what's happening?"
              className="w-full px-3 py-2 bg-paper sketch-border-soft text-sm placeholder:text-ink-soft/60 focus:outline-none focus:border-forest"
              required
            />
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="any details? (optional)"
              className="w-full px-3 py-2 bg-paper sketch-border-soft text-sm placeholder:text-ink-soft/60 focus:outline-none focus:border-forest"
            />
            <div className="flex items-center gap-3">
              <span className="hand text-sm text-ink-soft">when?</span>
              <TimeWheel
                value={form.start}
                onChange={(start) =>
                  /* picking a start defaults the end to an hour later */
                  setForm({ ...form, start, end: start ? plusOneHour(start) : null })
                }
              />
              {form.start && (
                <>
                  <span className="hand text-sm text-ink-soft">till</span>
                  <TimeWheel
                    value={form.end}
                    nullLabel="no end"
                    onChange={(end) => setForm({ ...form, end })}
                  />
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="hand text-sm text-ink-soft">until?</span>
              <input
                type="date"
                min={dateKey}
                value={form.endDate ?? ""}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value || null })
                }
                className="px-3 py-1.5 bg-paper sketch-border-soft text-sm text-ink-soft focus:outline-none focus:border-forest"
                aria-label="last day (optional)"
              />
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="hand text-sm text-ink-soft">repeats?</span>
              {RECUR_CHOICES.map((r) => {
                const value = r === "once" ? null : r;
                const selected = form.recur === value;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, recur: value })}
                    className={`hand text-sm cursor-pointer focus:outline-none focus-visible:underline focus-visible:decoration-wavy ${
                      selected
                        ? "text-forest font-bold underline decoration-wavy underline-offset-4"
                        : "quiet-link"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              {(["forest", "amber"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`size-6 rounded-full cursor-pointer transition-transform ${
                    c === "amber" ? "bg-amber" : "bg-forest"
                  } ${form.color === c ? "scale-110 ring-2 ring-ink/40 ring-offset-2 ring-offset-paper" : "opacity-50"}`}
                  aria-label={c}
                />
              ))}
              <div className="ml-auto flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="hand text-sm text-ink-soft hover:text-forest cursor-pointer"
                  >
                    cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={busy || !form.title.trim()}
                  className="hand sketch-border text-sm px-4 py-1.5 font-bold bg-forest text-paper border-forest hover:-rotate-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  {busy ? "saving..." : editingId ? "update" : "add"}
                </button>
              </div>
            </div>
            {error && (
              <p className="hand text-amber text-sm" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default DayCard;
