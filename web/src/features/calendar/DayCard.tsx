"use client";
import { useEffect, useState } from "react";

import {
  createEvent,
  updateEvent,
  deleteEvent,
  type CalEvent,
  type CalEventInput,
} from "@/features/calendar/api";
import EventForm from "./EventForm";
import { fmtTime } from "./time";

const SHORT_MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/* "2026-06-15" -> "jun 15", straight off the string so no timezone drama */
const fmtShortDate = (ymd: string) =>
  `${SHORT_MONTHS[Number(ymd.slice(5, 7)) - 1]} ${Number(ymd.slice(8, 10))}`;

interface DayCardProps {
  dateKey: string; // YYYY-MM-DD
  events: CalEvent[];
  canEdit: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const DayCard = ({ dateKey, events, canEdit, onClose, onChanged }: DayCardProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  /* bumping this remounts the create form blank after a save */
  const [nonce, setNonce] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingEvent = events.find((ev) => ev.id === editingId) ?? null;

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
    setConfirmId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSubmit = async (data: CalEventInput) => {
    if (!canEdit) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId) {
        await updateEvent(editingId, data);
      } else {
        await createEvent(data);
      }
      cancelEdit();
      setNonce((n) => n + 1);
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
          <div className="mt-6 pt-4 border-t border-dashed border-pencil">
            <EventForm
              key={editingId ?? `new-${nonce}`}
              dateKey={dateKey}
              initial={editingEvent}
              heading={editingEvent ? "edit event ✏️" : "scribble something in ✏️"}
              busy={busy}
              error={error}
              onSubmit={handleSubmit}
              onCancel={editingEvent ? cancelEdit : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCard;
