"use client";
import { useEffect, useRef } from "react";

import { TIME_SLOTS, fmtTime } from "./time";

const ROW = 32; // px, must match h-8 below

/* A scrollable picker wheel: "all day" then 00:00..23:45 in 15-minute
   steps. Spin (or click) to choose; the row resting in the centre band
   is the selected value. */
export default function TimeWheel({
  value,
  onChange,
  nullLabel = "all day",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  nullLabel?: string;
}) {
  const wheel = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipScroll = useRef(false);

  /* keep the wheel aligned with the value (initial mount, edit, cancel) */
  useEffect(() => {
    const idx = Math.max(0, TIME_SLOTS.indexOf(value));
    const el = wheel.current;
    if (el && Math.round(el.scrollTop / ROW) !== idx) {
      skipScroll.current = true;
      el.scrollTo({ top: idx * ROW });
    }
  }, [value]);

  const onScroll = () => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = wheel.current;
      if (!el) return;
      const idx = Math.min(
        TIME_SLOTS.length - 1,
        Math.max(0, Math.round(el.scrollTop / ROW)),
      );
      onChange(TIME_SLOTS[idx]);
    }, 120);
  };

  return (
    <div className="relative w-24 select-none" aria-label="time picker">
      {/* centre band marking the selected row */}
      <div
        className="pointer-events-none absolute inset-x-0 top-8 h-8 border-y border-dashed border-forest/60"
        aria-hidden
      />
      <div
        ref={wheel}
        onScroll={onScroll}
        className="h-24 overflow-y-auto snap-y snap-mandatory py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot ?? "all-day"}
            onClick={() => onChange(slot)}
            className={`hand h-8 flex items-center justify-center snap-center cursor-pointer text-sm transition-colors ${
              slot === value ? "text-forest font-bold" : "text-ink-soft/70"
            }`}
          >
            {slot ? fmtTime(slot) : nullLabel}
          </div>
        ))}
      </div>
    </div>
  );
}
