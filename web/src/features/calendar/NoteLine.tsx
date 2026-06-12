"use client";
import { useEffect, useState } from "react";

import { getNotes, saveNote, type NoteKind } from "./api";

/* A one-line scribble for a day/week/month/year. Self-contained: it
   fetches its own note for (kind, anchor) and, for the admin, edits in
   place — enter saves, escape bails, an emptied note is removed. */
export default function NoteLine({
  kind,
  anchor,
  canEdit,
  className = "",
}: {
  kind: NoteKind;
  anchor: string;
  canEdit: boolean;
  className?: string;
}) {
  /* null = still loading (render nothing, no flash) */
  const [note, setNote] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    setNote(null);
    setEditing(false);
    getNotes(anchor, anchor)
      .then((ns) => {
        if (!on) return;
        setNote(
          ns.find((n) => n.kind === kind && n.anchor === anchor)?.note ?? "",
        );
      })
      .catch(() => on && setNote(""));
    return () => {
      on = false;
    };
  }, [kind, anchor]);

  const save = () => {
    if (busy) return;
    setBusy(true);
    saveNote({ kind, anchor, note: draft })
      .then(() => {
        setNote(draft.trim());
        setEditing(false);
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  if (note === null) return null;

  if (editing) {
    return (
      <span className={`inline-flex items-baseline gap-2 ${className}`}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder={`a note for this ${kind}...`}
          aria-label={`note for this ${kind}`}
          className="hand text-sm bg-transparent border-b border-dashed border-forest placeholder:text-pencil focus:outline-none min-w-48"
        />
        <button
          onClick={save}
          disabled={busy}
          className="hand text-xs quiet-link cursor-pointer"
        >
          {busy ? "..." : "save"}
        </button>
      </span>
    );
  }

  if (!note && !canEdit) return null;

  return (
    <span className={`hand text-sm text-ink-soft ${className}`}>
      {note && <span className="mr-1.5">✎ {note}</span>}
      {canEdit && (
        <button
          onClick={() => {
            setDraft(note);
            setEditing(true);
          }}
          className="hand text-xs quiet-link cursor-pointer"
        >
          {note ? "edit" : `+ note this ${kind}`}
        </button>
      )}
    </span>
  );
}
