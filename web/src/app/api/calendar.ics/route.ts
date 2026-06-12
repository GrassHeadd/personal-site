import { sb } from "@/shared/db";

/* Outbound sync: an ICS feed of the hand-scribbled events, so Google/Apple/
   anything can subscribe to this calendar. Public, like GET /api/events.
   Feed-sourced events are NOT re-exported (they came from a calendar already). */

interface EventRow {
  id: string;
  date: string;
  title: string;
  note: string | null;
  start_time: string | null;
  end_time: string | null;
  updated_at: string;
}

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/* "2026-06-11", "15:30:00" -> "20260611T153000" (floating local time) */
const dt = (date: string, time: string) =>
  `${date.replace(/-/g, "")}T${time.replace(/:/g, "").padEnd(6, "0")}`;

export async function GET(req: Request) {
  /* calendar apps can't send cookies, so the private feed rides on a
     secret in the URL: /api/calendar.ics?key=... */
  const key = new URL(req.url).searchParams.get("key");
  const expected = process.env.CALENDAR_ICS_KEY || process.env.BLOG_API_KEY;
  if (!expected || key !== expected) {
    return new Response("Unauthorised", { status: 401 });
  }

  const res = await sb("events?deleted_at=is.null&order=date.asc");
  if (!res.ok) {
    return new Response("calendar feed unavailable", { status: 500 });
  }
  const rows: EventRow[] = await res.json();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//grasshut//calendar//EN",
    "X-WR-CALNAME:jj's grasshut",
  ];

  for (const ev of rows) {
    const stamp = new Date(ev.updated_at)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@grasshut`,
      `DTSTAMP:${stamp}`,
      ev.start_time
        ? `DTSTART:${dt(ev.date, ev.start_time)}`
        : `DTSTART;VALUE=DATE:${ev.date.replace(/-/g, "")}`,
    );
    if (ev.start_time && ev.end_time) {
      lines.push(`DTEND:${dt(ev.date, ev.end_time)}`);
    }
    lines.push(`SUMMARY:${esc(ev.title)}`);
    if (ev.note) lines.push(`DESCRIPTION:${esc(ev.note)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, s-maxage=600",
    },
  });
}
