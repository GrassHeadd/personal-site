import { sb, unauthorized } from "@/lib/talkerinos/db";
import { isAdmin } from "@/auth";
import { getFeedEvents } from "@/lib/calendar/feeds";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let q = "events?order=date.asc,created_at.asc";
  if (from && DATE_RE.test(from)) q += `&date=gte.${from}`;
  if (to && DATE_RE.test(to)) q += `&date=lte.${to}`;

  const res = await sb(q);
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const events = await res.json();

  /* synced calendars are personal: only merged for jj (or local dev) */
  const showFeeds = process.env.NODE_ENV === "development" || (await isAdmin());
  if (showFeeds && from && to) {
    events.push(...(await getFeedEvents(from, to)));
  }
  return Response.json(events);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.title?.trim() || !DATE_RE.test(body?.date ?? "")) {
    return Response.json({ error: "title and date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const res = await sb("events", {
    method: "POST",
    body: JSON.stringify({
      date: body.date,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      color: body.color === "amber" ? "amber" : "forest",
    }),
  });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: 500 });
  }
  const [row] = await res.json();
  return Response.json(row, { status: 201 });
}
