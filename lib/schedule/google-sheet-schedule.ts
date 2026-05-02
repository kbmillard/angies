import { parseCsvRows } from "@/lib/menu/csv-utils";
import type { ScheduleItem } from "./schema";

function parseBool(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return v === "true" || v === "yes" || v === "1" || v === "y";
}

function parseLatLng(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function parseScheduleFromCsvText(csvText: string): ScheduleItem[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];

  const header = rows[0]!.map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iId = idx("id");
  const iActive = idx("active");
  const iDate = idx("date");
  const iStart = idx("starttime");
  const iEnd = idx("endtime");
  const iTitle = idx("title");
  const iLocName = idx("locationname");
  const iAddr = idx("address");
  const iCity = idx("city");
  const iState = idx("state");
  const iZip = idx("zip");
  const iStatus = idx("status");
  const iStatusNote = idx("statusnote");
  const iMaps = idx("mapsurl");
  const iLat = idx("lat");
  const iLng = idx("lng");
  const iDesc = idx("description");
  const iFeat = idx("featured");
  const iSort = idx("sortorder");
  const iTz = idx("timezone");
  const iUpdated = idx("updatedat");

  if (iDate < 0) return [];

  const items: ScheduleItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    if (row.every((c) => c === "")) continue;

    const active = iActive < 0 ? true : parseBool(row[iActive] ?? "TRUE");
    if (!active) continue;

    const date = (row[iDate] ?? "").trim();
    if (!date) continue;

    const title = iTitle >= 0 ? (row[iTitle] ?? "").trim() : "";
    const id =
      iId >= 0 && (row[iId] ?? "").trim()
        ? (row[iId] ?? "").trim()
        : `sched-${date}-${title || "row"}`.slice(0, 96);

    items.push({
      id,
      active: true,
      date,
      startTime: iStart >= 0 ? (row[iStart] ?? "").trim() : "",
      endTime: iEnd >= 0 ? (row[iEnd] ?? "").trim() : "",
      title: title || "Scheduled stop",
      locationName: iLocName >= 0 ? (row[iLocName] ?? "").trim() : "",
      address: iAddr >= 0 ? (row[iAddr] ?? "").trim() : "",
      city: iCity >= 0 ? (row[iCity] ?? "").trim() : "",
      state: iState >= 0 ? (row[iState] ?? "").trim() : "",
      zip: iZip >= 0 ? (row[iZip] ?? "").trim() : "",
      status: iStatus >= 0 ? (row[iStatus] ?? "").trim() : "",
      statusNote: iStatusNote >= 0 ? (row[iStatusNote] ?? "").trim() : "",
      mapsUrl: iMaps >= 0 ? (row[iMaps] ?? "").trim() : "",
      lat: iLat >= 0 ? parseLatLng(row[iLat] ?? "") : null,
      lng: iLng >= 0 ? parseLatLng(row[iLng] ?? "") : null,
      description: iDesc >= 0 ? (row[iDesc] ?? "").trim() : "",
      featured: iFeat >= 0 ? parseBool(row[iFeat] ?? "FALSE") : false,
      sortOrder: iSort >= 0 ? Number(row[iSort] ?? "0") || 0 : 0,
      timezone: iTz >= 0 ? (row[iTz] ?? "").trim() || "America/Chicago" : "America/Chicago",
      updatedAt: iUpdated >= 0 ? (row[iUpdated] ?? "").trim() : "",
    });
  }

  return items;
}
