"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createEvent,
  updateEvent,
  type CalEvent,
} from "@/features/calendar/api";
import DayCard from "@/features/calendar/DayCard";
import { fmtTime, plusOneHour } from "@/features/calendar/time";

/* A full 24h timeline lives inside a fixed-height scroll window that
   opens at the first event of the day. Each hour is 48px, so a 15-min
   snap is 12px. */
const HOUR_PX = 48;
const TOTAL_PX = 24 * HOUR_PX;
const SNAP_PX = HOUR_PX / 4;
const DAY_MIN = 24 * 60;
const LAST_SLOT_MIN = 23 * 60 + 45;
const MIN_BLOCK_PX = 24;
/* blocks shorter than this drop to a single time-and-title line */
const ONE_LINE_PX = 36;

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (min: number) => {
  const c = Math.max(0, Math.min(LAST_SLOT_MIN, min));
  const h = String(Math.floor(c / 60)).padStart(2, "0");
  const m = String(c % 60).padStart(2, "0");
  return `${h}:${m}:00`;
};

const hourLabel = (h: number) =>
  h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;

type Times = { start_time: string | null; end_time: string | null };

type Drag = {
  id: string;
  mode: "move" | "resize";
  originY: number;
  deltaPx: number;
  moved: boolean;
};

type Lane = { col: number; cols: number };

/* Overlapping events share the column width side by side: greedy
   first-free-lane within each cluster of mutually overlapping blocks. */
function packLanes(
  items: { id: string; s: number; e: number }[],
): Record<string, Lane> {
  const sorted = [...items].sort((a, b) => a.s - b.s || b.e - a.e);
  const pos: Record<string, Lane> = {};
  let cluster: { id: string; col: number }[] = [];
  let active: { e: number; col: number }[] = [];
  let maxCol = 0;
  const flush = () => {
    for (const c of cluster) pos[c.id] = { col: c.col, cols: maxCol + 1 };
    cluster = [];
    maxCol = 0;
  };
  for (const it of sorted) {
    active = active.filter((a) => a.e > it.s);
    if (active.length === 0) flush();
    const used = new Set(active.map((a) => a.col));
    let col = 0;
    while (used.has(col)) col++;
    active.push({ e: it.e, col });
    cluster.push({ id: it.id, col });
    if (col > maxCol) maxCol = col;
  }
  flush();
  return pos;
}

/* a tiny "came from a to-do" hint on blocks and all-day rows */
const todoGlyph = (
  <span
    aria-hidden
    className="inline-block border border-current rounded-[3px] text-[8px] leading-none px-px align-middle mr-1 opacity-80"
  >
    ✓
  </span>
);

export default function DayPanel({
  events,
  today,
  canEdit,
}: {
  events: CalEvent[];
  today: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  /* optimistic times while a PUT is in flight; cleared back on failure */
  const [overrides, setOverrides] = useState<Record<string, Times>>({});
  const [hoverMin, setHoverMin] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(false);

  const allDay = events.filter((e) => !e.start_time);
  const timed = events.filter((e) => e.start_time);

  /* open the window on the day's first event (or 7am on a blank day);
     mount only — jumping the scroll under the user later would be rude */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const first = timed.length
      ? Math.min(...timed.map((e) => toMin(e.start_time!)))
      : 7 * 60;
    el.scrollTop = Math.max(0, (first / 60) * HOUR_PX - 16);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pretty = today
    ? new Date(`${today}T12:00:00`)
        .toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
        .toLowerCase()
    : "";

  const eff = (ev: CalEvent): Times =>
    overrides[ev.id] ?? { start_time: ev.start_time, end_time: ev.end_time };

  const spanOf = (ev: CalEvent) => {
    const t = eff(ev);
    const s = toMin(t.start_time!);
    const e = t.end_time ? Math.max(s + 15, toMin(t.end_time)) : s + 60;
    return { s, e };
  };

  const lanes = packLanes(timed.map((ev) => ({ id: ev.id, ...spanOf(ev) })));

  /* PUT replaces the row, so always send the complete event; recurring
     occurrences write back to the series row's own date. */
  const saveTimes = (ev: CalEvent, t: Times) => {
    const prev = overrides[ev.id];
    setOverrides((o) => ({ ...o, [ev.id]: t }));
    updateEvent(ev.id, {
      date: ev.series_date ?? ev.date,
      title: ev.title,
      note: ev.note ?? "",
      color: ev.color,
      start_time: t.start_time,
      end_time: t.end_time,
      end_date: ev.end_date,
      recur: ev.recur,
      todo_id: ev.todo_id,
    })
      .then(() => router.refresh())
      .catch(() => {
        setOverrides((o) => {
          const next = { ...o };
          if (prev) next[ev.id] = prev;
          else delete next[ev.id];
          return next;
        });
      });
  };

  const beginDrag = (
    e: React.PointerEvent,
    ev: CalEvent,
    mode: "move" | "resize",
  ) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ id: ev.id, mode, originY: e.clientY, deltaPx: 0, moved: false });
  };

  const moveDrag = (e: React.PointerEvent, ev: CalEvent) => {
    if (!drag || drag.id !== ev.id) return;
    const deltaPx = e.clientY - drag.originY;
    setDrag({
      ...drag,
      deltaPx,
      /* anything under 4px is a click, not a drag */
      moved: drag.moved || Math.abs(deltaPx) >= 4,
    });
  };

  const endDrag = (ev: CalEvent) => {
    if (!drag || drag.id !== ev.id) return;
    const d = drag;
    setDrag(null);
    if (!d.moved) {
      /* a clean click reopens the event modal */
      setShowCard(true);
      return;
    }
    const deltaMin = Math.round(d.deltaPx / SNAP_PX) * 15;
    if (deltaMin === 0) return;
    const t = eff(ev);
    if (!t.start_time) return;
    const startMin = toMin(t.start_time);
    if (d.mode === "move") {
      const dur = t.end_time
        ? Math.max(15, toMin(t.end_time) - startMin)
        : null;
      const ns = Math.max(
        0,
        Math.min(startMin + deltaMin, LAST_SLOT_MIN - (dur ?? 0)),
      );
      saveTimes(ev, {
        start_time: toTime(ns),
        end_time: dur != null ? toTime(ns + dur) : null,
      });
    } else {
      const endMin = t.end_time ? toMin(t.end_time) : startMin + 60;
      const ne = Math.min(
        Math.max(startMin + 15, endMin + deltaMin),
        LAST_SLOT_MIN,
      );
      saveTimes(ev, { start_time: t.start_time, end_time: toTime(ne) });
    }
  };

  /* HTML5 drop target for to-dos dragged in from the list; the grid is
     the scrolled content, so its rect already accounts for scrollTop */
  const slotFromClientY = (clientY: number): number | null => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect || !Number.isFinite(clientY)) return null;
    const slot = Math.floor((clientY - rect.top) / SNAP_PX);
    const max = (TOTAL_PX - HOUR_PX) / SNAP_PX;
    return Math.max(0, Math.min(slot, max)) * 15;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setHoverMin(slotFromClientY(e.clientY));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const min = slotFromClientY(e.clientY) ?? hoverMin;
    setHoverMin(null);
    let payload: { id?: string; title?: string };
    try {
      payload = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }
    if (!payload?.id || !payload?.title || min == null) return;
    const start = toTime(min);
    createEvent({
      date: today,
      title: payload.title,
      color: "forest",
      start_time: start,
      end_time: plusOneHour(start),
      todo_id: payload.id,
    })
      .then(() => router.refresh())
      .catch(() => {});
  };

  return (
    <section className="sketch-border-soft bg-paper px-4 py-5">
      <h2 className="hand text-xl font-bold leading-none">
        today<span className="text-forest">.</span>
      </h2>
      {pretty && <p className="hand text-xs text-ink-soft mt-1">{pretty}</p>}

      {/* whole-day density strip: where the day is busy, at a glance */}
      {timed.length > 0 && (
        <div
          aria-hidden
          className="relative mt-3 h-1.5 rounded-full bg-paper-2 overflow-hidden"
        >
          {timed.map((ev) => {
            const { s, e } = spanOf(ev);
            return (
              <span
                key={ev.id}
                className={`absolute inset-y-0 rounded-full ${
                  ev.color === "amber" ? "bg-amber" : "bg-forest"
                }`}
                style={{
                  left: `${(s / DAY_MIN) * 100}%`,
                  width: `${Math.max(1.5, ((e - s) / DAY_MIN) * 100)}%`,
                }}
              />
            );
          })}
        </div>
      )}

      {allDay.length > 0 && (
        <ul aria-label="all day" className="mt-3 flex flex-col gap-1">
          {allDay.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 min-w-0">
              <span
                aria-hidden
                className={`size-2 rounded-full shrink-0 ${
                  ev.color === "amber" ? "bg-amber" : "bg-forest"
                }`}
              />
              <span className="hand text-sm truncate">
                {ev.todo_id && todoGlyph}
                {ev.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={scrollRef}
        className="mt-4 h-[26rem] overflow-y-auto overscroll-contain [scrollbar-width:thin]"
      >
        <div
          ref={gridRef}
          data-testid="day-timeline"
          className="relative select-none"
          style={{ height: TOTAL_PX }}
          onDragOver={canEdit ? onDragOver : undefined}
          onDragLeave={canEdit ? () => setHoverMin(null) : undefined}
          onDrop={canEdit ? onDrop : undefined}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              aria-hidden
              className="absolute inset-x-0 border-t border-dashed border-pencil"
              style={{ top: h * HOUR_PX }}
            >
              <span className="hand text-[10px] text-ink-soft absolute top-0.5 left-0">
                {hourLabel(h)}
              </span>
            </div>
          ))}

          {timed.length === 0 && allDay.length === 0 && (
            <p
              className="hand text-sm text-ink-soft absolute inset-x-0 text-center -rotate-1 opacity-70 pointer-events-none"
              style={{ top: 7 * HOUR_PX + 40 }}
            >
              {canEdit
                ? "nothing scheduled. drag a to-do in."
                : "nothing scheduled today."}
            </p>
          )}

          {hoverMin != null && (
            <div
              aria-hidden
              className="absolute left-8 right-1 rounded border border-dashed border-forest bg-forest/10 pointer-events-none"
              style={{ top: (hoverMin / 60) * HOUR_PX, height: HOUR_PX }}
            >
              <span className="hand text-[10px] text-forest pl-1.5">
                {fmtTime(toTime(hoverMin))}
              </span>
            </div>
          )}

          {timed.map((ev) => {
            const t = eff(ev);
            const startMin = toMin(t.start_time!);
            const durMin = t.end_time
              ? Math.max(15, toMin(t.end_time) - startMin)
              : 60;
            const isDrag = drag?.id === ev.id;
            const snapPx = isDrag
              ? Math.round(drag.deltaPx / SNAP_PX) * SNAP_PX
              : 0;
            let top = (startMin / 60) * HOUR_PX;
            let height = Math.max(MIN_BLOCK_PX, (durMin / 60) * HOUR_PX);
            if (isDrag && drag.mode === "move") top += snapPx;
            if (isDrag && drag.mode === "resize")
              height = Math.max(MIN_BLOCK_PX, height + snapPx);
            top = Math.max(0, Math.min(top, TOTAL_PX - MIN_BLOCK_PX));
            height = Math.max(MIN_BLOCK_PX, Math.min(height, TOTAL_PX - top));
            const lane = lanes[ev.id] ?? { col: 0, cols: 1 };
            return (
              <div
                key={ev.id}
                onPointerDown={
                  canEdit ? (e) => beginDrag(e, ev, "move") : undefined
                }
                onPointerMove={canEdit ? (e) => moveDrag(e, ev) : undefined}
                onPointerUp={canEdit ? () => endDrag(ev) : undefined}
                onClick={!canEdit ? () => setShowCard(true) : undefined}
                className={`absolute rounded px-1.5 py-0.5 overflow-hidden text-paper border border-paper ${
                  ev.color === "amber" ? "bg-amber" : "bg-forest"
                } ${canEdit ? "cursor-grab" : "cursor-pointer"} ${
                  isDrag ? "opacity-80 z-10" : ""
                }`}
                style={{
                  top,
                  height,
                  touchAction: "none",
                  left: `calc(2rem + ${lane.col} * ((100% - 2.25rem) / ${lane.cols}))`,
                  width: `calc((100% - 2.25rem) / ${lane.cols})`,
                }}
              >
                {height < ONE_LINE_PX ? (
                  <p className="hand text-[11px] leading-tight truncate">
                    {ev.todo_id && todoGlyph}
                    {fmtTime(t.start_time)} {ev.title}
                  </p>
                ) : (
                  <>
                    <p className="hand text-[11px] leading-tight truncate opacity-90">
                      {ev.todo_id && todoGlyph}
                      {fmtTime(t.start_time)}
                      {t.end_time ? ` – ${fmtTime(t.end_time)}` : ""}
                    </p>
                    <p className="hand text-sm leading-tight truncate">
                      {ev.title}
                    </p>
                  </>
                )}
                {canEdit && (
                  /* pointer capture lands on this handle; move/up events
                     bubble up to the block's handlers above */
                  <div
                    aria-hidden
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag(e, ev, "resize");
                    }}
                    className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showCard && (
        <DayCard
          dateKey={today}
          events={events}
          canEdit={canEdit}
          onClose={() => setShowCard(false)}
          onChanged={() => router.refresh()}
        />
      )}
    </section>
  );
}
