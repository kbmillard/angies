import { parseScheduleFromCsvText } from "./google-sheet-schedule";
import { localScheduleItems } from "./local-schedule";
import type { ScheduleItem, ScheduleResponse, ScheduleSource } from "./schema";

function chicagoCalendarDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function sortKey(it: ScheduleItem): string {
  const t = (it.startTime || "00:00").trim().padStart(5, "0");
  return `${it.date}T${t}`;
}

function isUpcomingOrToday(it: ScheduleItem, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(it.date)) return true;
  return it.date >= today;
}

function buildResponse(
  items: ScheduleItem[],
  source: ScheduleSource,
  updatedAt: string,
): ScheduleResponse {
  const today = chicagoCalendarDate(new Date());
  const upcoming = items
    .filter((i) => i.active && isUpcomingOrToday(i, today))
    .sort((a, b) => {
      const ka = sortKey(a);
      const kb = sortKey(b);
      if (ka !== kb) return ka.localeCompare(kb);
      return a.sortOrder - b.sortOrder;
    });
  return { items: upcoming, source, updatedAt };
}

/**
 * Schedule CSV is cached ~5 minutes via fetch `revalidate: 300`.
 */
export async function getScheduleCatalog(): Promise<ScheduleResponse> {
  const updatedAt = new Date().toISOString();
  const url = process.env.SCHEDULE_CSV_URL ?? process.env.NEXT_PUBLIC_SCHEDULE_CSV_URL;

  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`Schedule CSV fetch ${res.status}`);
      const text = await res.text();
      const parsed = parseScheduleFromCsvText(text);
      return buildResponse(parsed, "google-sheet", updatedAt);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[schedule] Google Sheet / CSV failed, using local fallback:", e);
      }
    }
  }

  return buildResponse(localScheduleItems, "local-fallback", updatedAt);
}
