import { randomUUID } from "node:crypto";
import type { ScheduleItem } from "@/lib/schedule/schema";

function asBool(v: unknown, def: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  return def;
}

export function parseScheduleItemForAdmin(
  body: unknown,
  opts: { idOptional: boolean },
): { ok: true; item: ScheduleItem } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const o = body as Record<string, unknown>;

  let id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
  if (!id) {
    if (!opts.idOptional) return { ok: false, error: "id required" };
    id = randomUUID();
  }

  // Parse dayOfWeek (0-6) for recurring schedule
  let dayOfWeek: number | undefined;
  if (o.dayOfWeek !== undefined && o.dayOfWeek !== null && o.dayOfWeek !== "") {
    const dow = typeof o.dayOfWeek === "number" ? o.dayOfWeek : Number(o.dayOfWeek);
    if (Number.isInteger(dow) && dow >= 0 && dow <= 6) {
      dayOfWeek = dow;
    } else {
      return { ok: false, error: "dayOfWeek must be 0-6 (0=Sunday, 6=Saturday)" };
    }
  }

  // Parse date for one-time events
  const date = typeof o.date === "string" ? o.date.trim() : "";

  // Require either dayOfWeek OR date
  if (dayOfWeek === undefined && !date) {
    return { ok: false, error: "Either dayOfWeek or date is required" };
  }

  // Require locationName and times
  const locationName = typeof o.locationName === "string" ? o.locationName.trim() : "";
  if (!locationName) {
    return { ok: false, error: "locationName required" };
  }

  const startTime = typeof o.startTime === "string" ? o.startTime.trim() : "";
  const endTime = typeof o.endTime === "string" ? o.endTime.trim() : "";
  if (!startTime || !endTime) {
    return { ok: false, error: "startTime and endTime required" };
  }

  const sortN =
    typeof o.sortOrder === "number"
      ? o.sortOrder
      : typeof o.sortOrder === "string"
        ? Number(o.sortOrder)
        : 0;
  const sortOrder = Number.isFinite(sortN) ? sortN : 0;

  let lat: number | null = null;
  let lng: number | null = null;
  if (o.lat !== undefined && o.lat !== "") {
    const n = typeof o.lat === "number" ? o.lat : Number(o.lat);
    lat = Number.isFinite(n) ? n : null;
  }
  if (o.lng !== undefined && o.lng !== "") {
    const n = typeof o.lng === "number" ? o.lng : Number(o.lng);
    lng = Number.isFinite(n) ? n : null;
  }

  const item: ScheduleItem = {
    id,
    active: asBool(o.active, true),
    dayOfWeek,
    date: date || undefined,
    startTime,
    endTime,
    title: typeof o.title === "string" ? o.title : "",
    locationName,
    address: typeof o.address === "string" ? o.address : "",
    city: typeof o.city === "string" ? o.city : "",
    state: typeof o.state === "string" ? o.state : "",
    zip: typeof o.zip === "string" ? o.zip : "",
    status: typeof o.status === "string" ? o.status : "",
    statusNote: typeof o.statusNote === "string" ? o.statusNote : "",
    mapsUrl: typeof o.mapsUrl === "string" ? o.mapsUrl : "",
    lat,
    lng,
    description: typeof o.description === "string" ? o.description : "",
    featured: asBool(o.featured, false),
    sortOrder,
    timezone:
      typeof o.timezone === "string" && o.timezone.trim()
        ? o.timezone.trim()
        : "America/Chicago",
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : "",
  };

  return { ok: true, item };
}
