import { parseCsvRows } from "@/lib/menu/csv-utils";
import type { LocationItem, LocationType } from "./schema";

function parseBool(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return v === "true" || v === "yes" || v === "1" || v === "y";
}

function slugId(type: string, name: string) {
  const base = `${type}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, 96) || `loc-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeLocationType(raw: string): LocationType | null {
  const t = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (t === "restaurant") return "restaurant";
  if (t === "food_truck" || t === "foodtruck" || t === "truck") return "food_truck";
  return null;
}

function parseLatLng(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function parseLocationsFromCsvText(csvText: string): LocationItem[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];

  const header = rows[0]!.map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iId = idx("id");
  const iActive = idx("active");
  const iType = idx("type");
  const iSort = idx("sortorder");
  const iName = idx("name");
  const iLabel = idx("label");
  const iAddr = idx("address");
  const iCity = idx("city");
  const iState = idx("state");
  const iZip = idx("zip");
  const iHours = idx("hours");
  const iPhone = idx("phone");
  const iEmail = idx("email");
  const iStatus = idx("status");
  const iStatusNote = idx("statusnote");
  const iMaps = idx("mapsurl");
  const iEmbed = idx("embedurl");
  const iLat = idx("lat");
  const iLng = idx("lng");
  const iPlaceId = idx("placeid");
  const iFormatted = idx("formattedaddress");
  const iUpdated = idx("lastupdated");
  const iTimezone = idx("timezone");
  const iWeeklyHoursJson = idx("weeklyhoursjson");
  const iMessageBoard = idx("messageboard");

  if (iType < 0 || iName < 0) return [];

  const items: LocationItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    if (row.every((c) => c === "")) continue;

    const active = iActive < 0 ? true : parseBool(row[iActive] ?? "TRUE");
    if (!active) continue;

    const typeRaw = (row[iType] ?? "").trim();
    const type = normalizeLocationType(typeRaw);
    if (!type) continue;

    const name = (row[iName] ?? "").trim();
    if (!name) continue;

    const id =
      iId >= 0 && (row[iId] ?? "").trim() ? (row[iId] ?? "").trim() : slugId(type, name);

    const sortOrder = iSort >= 0 ? Number(row[iSort] ?? "0") || 0 : 0;

    const item: LocationItem = {
      id,
      active: true,
      type,
      sortOrder,
      name,
      label: iLabel >= 0 ? (row[iLabel] ?? "").trim() : "",
      address: iAddr >= 0 ? (row[iAddr] ?? "").trim() : "",
      city: iCity >= 0 ? (row[iCity] ?? "").trim() : "",
      state: iState >= 0 ? (row[iState] ?? "").trim() : "",
      zip: iZip >= 0 ? (row[iZip] ?? "").trim() : "",
      hours: iHours >= 0 ? (row[iHours] ?? "").trim() : "",
      phone: iPhone >= 0 ? (row[iPhone] ?? "").trim() : "",
      email: iEmail >= 0 ? (row[iEmail] ?? "").trim() : "",
      status: iStatus >= 0 ? (row[iStatus] ?? "").trim() : "",
      statusNote: iStatusNote >= 0 ? (row[iStatusNote] ?? "").trim() : "",
      mapsUrl: iMaps >= 0 ? (row[iMaps] ?? "").trim() : "",
      embedUrl: iEmbed >= 0 ? (row[iEmbed] ?? "").trim() : "",
      lat: iLat >= 0 ? parseLatLng(row[iLat] ?? "") : null,
      lng: iLng >= 0 ? parseLatLng(row[iLng] ?? "") : null,
      lastUpdated: iUpdated >= 0 ? (row[iUpdated] ?? "").trim() : "",
    };
    if (iPlaceId >= 0) {
      const pid = (row[iPlaceId] ?? "").trim();
      if (pid) item.placeId = pid;
    }
    if (iFormatted >= 0) {
      const fa = (row[iFormatted] ?? "").trim();
      if (fa) item.formattedAddress = fa;
    }
    if (iTimezone >= 0) {
      const tz = (row[iTimezone] ?? "").trim();
      if (tz) item.timezone = tz;
    }
    if (iWeeklyHoursJson >= 0) {
      const wh = (row[iWeeklyHoursJson] ?? "").trim();
      if (wh) item.weeklyHoursJson = wh;
    }
    if (iMessageBoard >= 0) {
      const mb = (row[iMessageBoard] ?? "").trim();
      if (mb) item.messageBoard = mb;
    }
    items.push(item);
  }

  return items;
}
