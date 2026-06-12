/* 15-minute time slots for the picker wheel. null = all-day. */
export const TIME_SLOTS: (string | null)[] = [
  null,
  ...Array.from({ length: 96 }, (_, i) => {
    const h = String(Math.floor(i / 4)).padStart(2, "0");
    const m = String((i % 4) * 15).padStart(2, "0");
    return `${h}:${m}:00`;
  }),
];

/* "14:15:00" -> "2:15pm", null -> "all day" */
export function fmtTime(t: string | null): string {
  if (!t) return "all day";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

/* "2026-06-12" ± n days, immune to timezones via noon UTC */
export function shiftDate(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/* default end = start + 1h, capped at the last slot of the day */
export function plusOneHour(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return h >= 23 ? "23:45:00" : `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}
