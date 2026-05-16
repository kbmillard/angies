import { randomUUID } from "node:crypto";
import type { LocationItem, LocationType } from "@/lib/locations/schema";

function asBool(v: unknown, def: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  return def;
}

function asType(raw: string): LocationType | null {
  const t = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (t === "restaurant") return "restaurant";
  if (t === "food_truck" || t === "foodtruck" || t === "truck") return "food_truck";
  return null;
}

export function parseLocationItemForAdmin(
  body: unknown,
  opts: { idOptional: boolean },
): { ok: true; item: LocationItem } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const o = body as Record<string, unknown>;

  let id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
  if (!id) {
    if (!opts.idOptional) return { ok: false, error: "id required" };
    id = randomUUID();
  }

  const typeRaw = typeof o.type === "string" ? o.type : "";
  const type = asType(typeRaw);
  if (!type) return { ok: false, error: "type must be restaurant or food_truck" };

  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) return { ok: false, error: "name required" };

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

  const item: LocationItem = {
    id,
    active: asBool(o.active, true),
    type,
    sortOrder,
    name,
    label: typeof o.label === "string" ? o.label : "",
    address: typeof o.address === "string" ? o.address : "",
    city: typeof o.city === "string" ? o.city : "",
    state: typeof o.state === "string" ? o.state : "",
    zip: typeof o.zip === "string" ? o.zip : "",
    hours: typeof o.hours === "string" ? o.hours : "",
    phone: typeof o.phone === "string" ? o.phone : "",
    email: typeof o.email === "string" ? o.email : "",
    status: typeof o.status === "string" ? o.status : "",
    statusNote: typeof o.statusNote === "string" ? o.statusNote : "",
    mapsUrl: typeof o.mapsUrl === "string" ? o.mapsUrl : "",
    embedUrl: typeof o.embedUrl === "string" ? o.embedUrl : "",
    lat,
    lng,
    lastUpdated: typeof o.lastUpdated === "string" ? o.lastUpdated : "",
  };

  if (typeof o.timezone === "string" && o.timezone.trim()) item.timezone = o.timezone.trim();
  if (typeof o.weeklyHoursJson === "string" && o.weeklyHoursJson.trim()) {
    item.weeklyHoursJson = o.weeklyHoursJson.trim();
  }
  if (typeof o.messageBoard === "string" && o.messageBoard.trim()) {
    item.messageBoard = o.messageBoard.trim();
  }
  if (typeof o.placeId === "string" && o.placeId.trim()) item.placeId = o.placeId.trim();
  if (typeof o.formattedAddress === "string" && o.formattedAddress.trim()) {
    item.formattedAddress = o.formattedAddress.trim();
  }

  return { ok: true, item };
}
