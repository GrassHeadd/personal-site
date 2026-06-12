"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import Squiggle from "@/components/Squiggle";
import DayCard from "@/components/DayCard";
import Footer from "@/sections/Footer";
import { getEvents, type CalEvent } from "@/lib/calendar/api";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const startOfWeek = (d: Date) => {
  const out = new Date(d);
  out.setDate(d.getDate() - d.getDay());
  return out;
};

const addDays = (d: Date, n: number) => {
  const out = new Date(d);
  out.setDate(d.getDate() + n);
  return out;
};

type View = "month" | "week";

export default function CalendarPage() {
  // render only after mount so the server/client clock can't disagree
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(new Date(2026, 0, 1));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCursor(now);
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCanEdit(!!d.admin))
      .catch(() => {});
  }, []);

  /* visible range */
  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      return { from: ymd(start), to: ymd(addDays(start, 6)) };
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { from: ymd(first), to: ymd(last) };
  }, [cursor, view]);

  const refetch = useCallback(() => {
    if (!today) return;
    getEvents(range.from, range.to)
      .then((evs) => {
        setEvents(evs);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [today, range.from, range.to]);

  useEffect(refetch, [refetch]);

  const byDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const ev of events) (map[ev.date] ??= []).push(ev);
    return map;
  }, [events]);

  const shift = (dir: 1 | -1) => {
    setCursor((c) =>
      view === "week"
        ? addDays(c, 7 * dir)
        : new Date(c.getFullYear(), c.getMonth() + dir, 1),
    );
  };

  const isToday = (key: string) => !!today && key === ymd(today);

  /* cells for month view: leading/trailing nulls pad to complete weeks */
  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = [
      ...Array.from({ length: first.getDay() }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) =>
        ymd(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
      ),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => ymd(addDays(start, i)));
  }, [cursor]);

  const heading =
    view === "week"
      ? `week of ${MONTHS[startOfWeek(cursor).getMonth()].slice(0, 3)} ${startOfWeek(cursor).getDate()}`
      : MONTHS[cursor.getMonth()];

  const chip = (ev: CalEvent) => (
    <span
      key={ev.id}
      className={`hand text-[11px] leading-tight px-1 py-px rounded text-paper truncate ${
        ev.color === "amber" ? "bg-amber" : "bg-forest"
      }`}
    >
      {ev.title}
    </span>
  );

  const dayNumber = (key: string) => Number(key.slice(8));

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-36 md:pt-44 min-h-screen">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">
          calendar<span className="text-forest">.</span>
        </h1>
        <Squiggle className="w-44 md:w-64 h-3 mb-4" />
        <p className="text-ink-soft max-w-xl mb-10">
          What I&apos;m up to. Click a day to peek
          {canEdit ? ", or to scribble something in" : ""}.
        </p>

        {/* controls */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-6">
          <button onClick={() => shift(-1)} className="hand quiet-link text-lg cursor-pointer" aria-label="previous">
            ← prev
          </button>
          <h2 className="text-2xl md:text-3xl font-bold flex-1 text-center">
            {heading} <span className="text-forest">{cursor.getFullYear()}</span>
          </h2>
          <button onClick={() => shift(1)} className="hand quiet-link text-lg cursor-pointer" aria-label="next">
            next →
          </button>
          <span className="w-full sm:w-auto flex items-baseline justify-center gap-3 sm:ml-4">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`hand text-sm cursor-pointer focus:outline-none focus-visible:underline focus-visible:decoration-wavy ${
                  view === v
                    ? "text-forest font-bold underline decoration-wavy underline-offset-4"
                    : "quiet-link"
                }`}
              >
                {v}
              </button>
            ))}
            <button
              onClick={() => today && setCursor(today)}
              className="hand text-sm quiet-link cursor-pointer"
            >
              today
            </button>
          </span>
        </div>

        {loadError && (
          <p className="hand text-amber text-sm mb-4" role="alert">
            couldn&apos;t load events, the page is showing an empty calendar.
          </p>
        )}

        {/* grid */}
        <div className="sketch-border-soft overflow-hidden bg-paper">
          <div className="grid grid-cols-7 border-b border-dashed border-pencil">
            {DAYS.map((d) => (
              <div key={d} className="hand text-center text-xs font-bold text-ink-soft py-1.5">
                {d}
              </div>
            ))}
          </div>

          {!today ? (
            <p className="hand text-center text-ink-soft py-16">
              flipping to today&apos;s page...
            </p>
          ) : view === "month" ? (
            <div className="grid grid-cols-7">
              {monthCells.map((key, i) => (
                <div
                  key={key ?? `empty-${i}`}
                  className={`min-h-24 md:min-h-32 p-1 md:p-1.5 ${
                    i % 7 !== 0 ? "border-l" : ""
                  } ${i >= 7 ? "border-t" : ""} border-dashed border-pencil ${
                    key ? "cursor-pointer hover:bg-paper-2 transition-colors" : ""
                  }`}
                  onClick={() => key && setSelectedDay(key)}
                >
                  {key && (
                    <>
                      <span
                        className={`inline-flex items-center justify-center size-6 text-xs ${
                          isToday(key)
                            ? "sketch-border !border-forest text-forest font-bold"
                            : "text-ink-soft"
                        }`}
                      >
                        {dayNumber(key)}
                      </span>
                      <div className="flex flex-col gap-1 mt-1">
                        {(byDate[key] ?? []).slice(0, 5).map(chip)}
                        {(byDate[key]?.length ?? 0) > 5 && (
                          <span className="hand text-[11px] text-ink-soft">
                            +{byDate[key].length - 5} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {weekDays.map((key, i) => (
                <div
                  key={key}
                  className={`min-h-64 md:min-h-80 p-1 md:p-1.5 ${
                    i !== 0 ? "border-l" : ""
                  } border-dashed border-pencil cursor-pointer hover:bg-paper-2 transition-colors`}
                  onClick={() => setSelectedDay(key)}
                >
                  <span
                    className={`inline-flex items-center justify-center size-6 text-xs ${
                      isToday(key)
                        ? "sketch-border !border-forest text-forest font-bold"
                        : "text-ink-soft"
                    }`}
                  >
                    {dayNumber(key)}
                  </span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {(byDate[key] ?? []).map((ev) => (
                      <div key={ev.id} className="flex flex-col">
                        {chip(ev)}
                        {ev.note && (
                          <span className="text-ink-soft text-[11px] leading-snug mt-0.5 line-clamp-2">
                            {ev.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="hand text-sm text-ink-soft mt-4 -rotate-[0.3deg]">
          ✏️ synced from the braindump, eventually. scribbled by hand for now.
        </p>
      </main>

      {selectedDay && (
        <DayCard
          dateKey={selectedDay}
          events={byDate[selectedDay] ?? []}
          canEdit={canEdit}
          onClose={() => setSelectedDay(null)}
          onChanged={refetch}
        />
      )}

      <Footer />
    </>
  );
}
