import type { ScheduleItem } from "@/lib/schedule/schema";
import { MAPS_FALLBACK_SEARCH_QUERY } from "@/lib/locations/helpers";

export function formatScheduleWhen(it: ScheduleItem): string {
  const d = it.date?.trim();
  const a = it.startTime?.trim();
  const b = it.endTime?.trim();
  if (!d) return "—";
  if (a && b) return `${d} · ${a} – ${b}`;
  if (a) return `${d} · from ${a}`;
  return d;
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
