"use client";
import { useEffect, useState } from "react";

import {
  updateEvent,
  deleteEvent,
  type CalEvent,
  type CalEventInput,
} from "./api";
import EventForm from "./EventForm";
import { fmtTime } from "./time";

const SHORT_MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

const fmtShortDate = (ymd: string) =>
  `${SHORT_MONTHS[Number(ymd.slice(5, 7)) - 1]} ${Number(ymd.slice(8, 10))}`;

/* A popup for one event: visitors get a peek, the admin gets the form. */
export default function EventCard({
  event,
  canEdit,
  onClose,
  onChanged,
}: {
  event: CalEvent;
  canEdit: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (data: CalEventInput) => {
    setBusy(true);
    setError(null);
    try {
      await updateEvent(event.id, data);
      onChanged();
      onClose();
    } catch {
      setError("that didn't save, try again");
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteEvent(event.id);
      onChanged();
      onClose();
    } catch {
      setError("couldn't delete that");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/25 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="sketch-border bg-paper w-full max-w-md max-h-[85vh] overflow-y-auto p-6 md:p-8 -rotate-[0.5deg] shadow-[4px_6px_0_rgba(51,48,42,0.08)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={event.title}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="text-xl md:text-2xl font-bold lowercase flex items-center gap-2 min-w-0">
            <span
              aria-hidden
              className={`size-2.5 rounded-full shrink-0 ${
                event.color === "amber" ? "bg-amber" : "bg-forest"
              }`}
            />
            <span className="truncate">{event.title}</span>
          </h2>
          <button
            onClick={onClose}
            className="hand text-ink-soft hover:text-forest text-xl leading-none cursor-pointer"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <p className="hand text-sm text-ink-soft">
          {fmtShortDate(event.date)}
          {event.end_date && ` → ${fmtShortDate(event.end_date)}`}
          {event.start_time && (
            <>
              {" · "}
              <span className="text-forest">
                {fmtTime(event.start_time)}
                {event.end_time && `–${fmtTime(event.end_time)}`}
              </span>
            </>
          )}
          {event.recur && (
            <span title={`repeats ${event.recur}`}> · ↻ {event.recur}</span>
          )}
        </p>
        {event.note && (
          <p className="text-ink-soft text-sm leading-snug mt-1.5">
            {event.note}
          </p>
        )}

        {canEdit ? (
          <div className="mt-5 pt-4 border-t border-dashed border-pencil">
            <EventForm
              dateKey={event.date}
              initial={event}
              heading="edit event ✏️"
              busy={busy}
              error={error}
              onSubmit={save}
            />
            <button
              onClick={del}
              disabled={busy}
              className={`hand text-sm mt-3 cursor-pointer ${
                confirm ? "text-amber font-bold" : "text-ink-soft hover:text-amber"
              }`}
            >
              {confirm ? "sure? this scraps it" : "delete event"}
            </button>
          </div>
        ) : (
          <p className="hand text-xs text-ink-soft/70 mt-6 pt-4 border-t border-dashed border-pencil">
            jj scribbles in here after whispering the magic word.
          </p>
        )}
      </div>
    </div>
  );
}
