import type { ScheduleItem } from "@/lib/schedule/schema";
import { MAPS_FALLBACK_SEARCH_QUERY } from "@/lib/locations/helpers";

export function formatScheduleWhen(it: ScheduleItem): string {
  const d = it.date?.trim();
  const a = it.startTime?.trim();
  const b = it.endTime?.trim();
  if (!d) return "—";
  
  const formattedDate = formatFullDate(d);
  if (a && b) return `${formattedDate} · ${formatTimeRange(a, b)}`;
  if (a) return `${formattedDate} · from ${a}`;
  return formattedDate || d;
}

export function scheduleLineAddress(it: ScheduleItem): string {
  const parts = [it.address, [it.city, it.state, it.zip].filter(Boolean).join(" ")].filter(
    Boolean,
  );
  return parts.join(" · ");
}

export function scheduleMapsHref(it: ScheduleItem): string {
  const u = it.mapsUrl?.trim();
  if (u) return u;
  const q = encodeURIComponent(
    scheduleLineAddress(it) || it.locationName || MAPS_FALLBACK_SEARCH_QUERY,
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function scheduleAppleHref(it: ScheduleItem): string {
  const qApple = encodeURIComponent(
    scheduleLineAddress(it) || it.locationName || MAPS_FALLBACK_SEARCH_QUERY,
  );
  return `https://maps.apple.com/?q=${qApple}`;
}

export function formatDayOfWeek(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  } catch {
    return "";
  }
}

export function formatTimeRange(startTime: string | undefined, endTime: string | undefined): string {
  if (!startTime || !endTime) return "";
  
  const formatTime = (time: string): string => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${m} ${period}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function formatFullDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("en-US", { 
      weekday: "long", 
      month: "long", 
      day: "numeric" 
    }).format(date);
  } catch {
    return "";
  }
}
