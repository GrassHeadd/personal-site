/* Server-side ICS feed ingestion: merges external calendars (Google/iCloud
   secret ICS URLs) into the events API. Read-only; gated to the admin. */
import ical, { type VEvent } from "node-ical";

export interface FeedEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  note: string | null;
  color: "pencil";
  source: "feed";
}

const TZ = process.env.CALENDAR_TZ || "America/New_York";
const TTL_MS = 10 * 60 * 1000;

let cache: { at: number; vevents: VEvent[] } | null = null;

const dateKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

const timeLabel = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .toLowerCase()
    .replace(" ", "")
    .replace(":00", "");

async function loadFeeds(urls: string[]): Promise<VEvent[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.vevents;
  const vevents: VEvent[] = [];
  await Promise.all(
    urls.map(async (url) => {
      try {
        const data = await ical.async.fromURL(url);
        for (const item of Object.values(data)) {
          if ((item as VEvent).type === "VEVENT") vevents.push(item as VEvent);
        }
      } catch (err) {
        console.error(`calendar feed failed: ${url.slice(0, 40)}...`, err);
      }
    }),
  );
  cache = { at: Date.now(), vevents };
  return vevents;
}

export async function getFeedEvents(from: string, to: string): Promise<FeedEvent[]> {
  const urls = (process.env.CALENDAR_FEEDS ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  if (!urls.length) return [];

  const rangeStart = new Date(`${from}T00:00:00`);
  const rangeEnd = new Date(`${to}T23:59:59`);
  const vevents = await loadFeeds(urls);
  const out: FeedEvent[] = [];

  for (const ev of vevents) {
    if (!ev.start) continue;
    const isAllDay = (ev.datetype ?? "") === "date";

    const occurrences: Date[] = [];
    if (ev.rrule) {
      occurrences.push(...ev.rrule.between(rangeStart, rangeEnd, true));
    } else if (ev.start >= rangeStart && ev.start <= rangeEnd) {
      occurrences.push(ev.start);
    }
    if (!occurrences.length) continue;

    const exdates = ev.exdate
      ? Object.values(ev.exdate).map((x) => dateKey(new Date(x as unknown as string | Date)))
      : [];

    for (const occ of occurrences) {
      const key = dateKey(occ);
      if (exdates.includes(key)) continue;
      const summary = String(ev.summary ?? "busy");
      out.push({
        id: `feed-${ev.uid}-${key}`,
        date: key,
        title: isAllDay ? summary : `${timeLabel(occ)} ${summary}`,
        note: null,
        color: "pencil",
        source: "feed",
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
