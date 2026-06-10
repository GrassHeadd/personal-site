"use client";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Squiggle from "@/components/Squiggle";
import Footer from "@/sections/Footer";
import { calEvents, type CalEvent } from "@/constants/events";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const toKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const eventsByDate = calEvents.reduce<Record<string, CalEvent[]>>((acc, ev) => {
  (acc[ev.date] ??= []).push(ev);
  return acc;
}, {});

export default function CalendarPage() {
  // render the grid only after mount so the server/client clock can't disagree
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState({ year: 2026, month: 0 });

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setView({ year: now.getFullYear(), month: now.getMonth() });
  }, []);

  const shiftMonth = (delta: number) => {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to complete weeks so trailing empty cells still draw their borders
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    !!today &&
    today.getFullYear() === view.year &&
    today.getMonth() === view.month &&
    today.getDate() === day;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-36 md:pt-44 min-h-screen">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">
          calendar<span className="text-forest">.</span>
        </h1>
        <Squiggle className="w-44 md:w-64 h-3 mb-4" />
        <p className="text-ink-soft max-w-xl mb-10">
          What I&apos;m up to. Hand-scribbled for now — auto-synced from the
          braindump eventually.
        </p>

        {/* month switcher */}
        <div className="flex items-baseline justify-between mb-6">
          <button
            onClick={() => shiftMonth(-1)}
            className="hand quiet-link text-lg cursor-pointer"
            aria-label="previous month"
          >
            ← prev
          </button>
          <h2 className="text-2xl md:text-3xl font-bold">
            {MONTHS[view.month]}{" "}
            <span className="text-forest">{view.year}</span>
          </h2>
          <button
            onClick={() => shiftMonth(1)}
            className="hand quiet-link text-lg cursor-pointer"
            aria-label="next month"
          >
            next →
          </button>
        </div>

        {/* grid */}
        <div className="sketch-border-soft overflow-hidden bg-paper">
          <div className="grid grid-cols-7 border-b border-dashed border-pencil">
            {DAYS.map((d) => (
              <div
                key={d}
                className="hand text-center text-sm font-bold text-ink-soft py-2"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {today &&
              cells.map((day, i) => {
                const key = day ? toKey(view.year, view.month, day) : `empty-${i}`;
                const events = day ? (eventsByDate[key] ?? []) : [];
                return (
                  <div
                    key={key}
                    className={`min-h-20 md:min-h-24 p-1.5 md:p-2 ${
                      i % 7 !== 0 ? "border-l" : ""
                    } ${i >= 7 ? "border-t" : ""} border-dashed border-pencil`}
                  >
                    {day && (
                      <>
                        <span
                          className={`inline-flex items-center justify-center size-7 text-sm ${
                            isToday(day)
                              ? "sketch-border !border-forest text-forest font-bold"
                              : "text-ink-soft"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="flex flex-col gap-1 mt-1">
                          {events.map((ev) => (
                            <span
                              key={ev.title}
                              className={`hand text-xs leading-tight px-1.5 py-0.5 rounded-md text-paper ${
                                ev.color === "amber" ? "bg-amber" : "bg-forest"
                              }`}
                            >
                              {ev.title}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
          {!today && (
            <p className="hand text-center text-ink-soft py-16">
              flipping to today&apos;s page...
            </p>
          )}
        </div>

        <p className="hand text-sm text-ink-soft mt-4 -rotate-[0.3deg]">
          ✏️ events live in <code className="text-forest">constants/events.ts</code>{" "}
          until the workflows plot gets planted.
        </p>
      </main>
      <Footer />
    </>
  );
}
