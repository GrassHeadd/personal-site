export interface CalEvent {
  /** ISO date, e.g. "2026-06-14" */
  date: string;
  title: string;
  /** accent for the chip */
  color?: "forest" | "amber";
}

/* hand-maintained for now — the braindump/grassdump sync will replace this */
export const calEvents: CalEvent[] = [
  { date: "2026-06-10", title: "redesign the grasshut", color: "forest" },
  { date: "2026-06-21", title: "touch grass", color: "amber" },
];
