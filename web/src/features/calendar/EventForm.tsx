"use client";
import { useState } from "react";

import type { CalEvent, CalEventInput, Recur } from "./api";
import TimeWheel from "./TimeWheel";
import { plusOneHour } from "./time";

const RECUR_CHOICES = ["once", "daily", "weekly", "monthly", "yearly"] as const;

/* One form for creating and editing events. PUT replaces the whole row,
   so the submitted payload always carries every field — including the
   series date and todo link of the event being edited. Parents remount
   (via key) to reset or switch the event. */
export default function EventForm({
  dateKey,
  initial = null,
  heading,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  dateKey: string;
  initial?: CalEvent | null;
  heading: string;
  busy: boolean;
  error: string | null;
  onSubmit: (data: CalEventInput) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    note: initial?.note ?? "",
    color: (initial?.color ?? "forest") as "forest" | "amber",
    start: initial?.start_time ?? null,
    end: initial?.end_time ?? null,
    endDate: initial?.end_date ?? null,
    recur: (initial?.recur ?? null) as Recur | null,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !form.title.trim()) return;
    onSubmit({
      /* edits must keep the series anchored to its true start date */
      date: initial ? (initial.series_date ?? initial.date) : dateKey,
      title: form.title,
      note: form.note,
      color: form.color,
      start_time: form.start,
      end_time: form.start ? form.end : null,
      end_date: form.endDate,
      recur: form.recur,
      todo_id: initial?.todo_id ?? null,
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <p className="hand text-sm font-bold text-ink-soft">{heading}</p>
      {initial && form.recur && (
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
          onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
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
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
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
            {busy ? "saving..." : initial ? "update" : "add"}
          </button>
        </div>
      </div>
      {error && (
        <p className="hand text-amber text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
