import { describe, expect, it } from "vitest";

import { expandEvents, type EventRow } from "./expand";

const make = (over: Partial<EventRow & { created_at: string }>): EventRow => ({
  id: "00000000-0000-0000-0000-000000000001",
  date: "2026-06-10",
  title: "event",
  note: null,
  color: "forest",
  start_time: null,
  end_time: null,
  end_date: null,
  recur: null,
  todo_id: null,
  ...over,
});

describe("expandEvents", () => {
  it("passes a single-day event inside the window through, with series_date", () => {
    const out = expandEvents([make({ date: "2026-06-10" })], "2026-06-01", "2026-06-30");
    expect(out).toHaveLength(1);
    expect(out[0].date).toBe("2026-06-10");
    expect(out[0].series_date).toBe("2026-06-10");
    expect(out[0].title).toBe("event");
  });

  it("emits only in-window days for a multi-day event spanning the window edge", () => {
    const out = expandEvents(
      [make({ date: "2026-05-29", end_date: "2026-06-02" })],
      "2026-06-01",
      "2026-06-30",
    );
    expect(out.map((e) => e.date)).toEqual(["2026-06-01", "2026-06-02"]);
    for (const e of out) {
      expect(e.series_date).toBe("2026-05-29");
      expect(e.end_date).toBe("2026-06-02");
    }
  });

  it("expands a weekly series into one occurrence per week of the window", () => {
    const out = expandEvents(
      [make({ date: "2026-06-15", recur: "weekly" })],
      "2026-06-14",
      "2026-07-04",
    );
    expect(out.map((e) => e.date)).toEqual(["2026-06-15", "2026-06-22", "2026-06-29"]);
    expect(out.every((e) => e.series_date === "2026-06-15")).toBe(true);
  });

  it("fast-forwards a daily series started long before the window", () => {
    const t0 = performance.now();
    const out = expandEvents(
      [make({ date: "2025-06-10", recur: "daily" })],
      "2026-06-10",
      "2026-06-12",
    );
    const elapsed = performance.now() - t0;
    expect(out.map((e) => e.date)).toEqual(["2026-06-10", "2026-06-11", "2026-06-12"]);
    expect(out.every((e) => e.series_date === "2025-06-10")).toBe(true);
    /* arithmetic fast-forward, not a 365-step walk; generous bound */
    expect(elapsed).toBeLessThan(100);
  });

  it("monthly on the 31st skips months without a 31st", () => {
    const out = expandEvents(
      [make({ date: "2026-01-31", recur: "monthly" })],
      "2026-01-01",
      "2026-06-30",
    );
    expect(out.map((e) => e.date)).toEqual(["2026-01-31", "2026-03-31", "2026-05-31"]);
  });

  it("yearly recurs on the same month and day the next year", () => {
    const out = expandEvents(
      [make({ date: "2025-03-15", recur: "yearly" })],
      "2026-03-01",
      "2026-03-31",
    );
    expect(out.map((e) => e.date)).toEqual(["2026-03-15"]);
    expect(out[0].series_date).toBe("2025-03-15");
  });

  it("sorts all-day entries before timed ones on the same date", () => {
    const out = expandEvents(
      [
        make({ id: "00000000-0000-0000-0000-00000000000a", start_time: "09:00:00" }),
        make({ id: "00000000-0000-0000-0000-00000000000b", start_time: null }),
        make({ id: "00000000-0000-0000-0000-00000000000c", start_time: "08:00:00" }),
      ],
      "2026-06-01",
      "2026-06-30",
    );
    expect(out.map((e) => e.start_time)).toEqual([null, "08:00:00", "09:00:00"]);
  });
});
