/**
 * Lightweight checks for `getLocationPublicStatus` (America/Chicago, sheet `Open` ignored).
 * Run: npx tsx scripts/validate-location-hours.ts
 */
import { getLocationPublicStatus } from "../lib/locations/hours";
import type { LocationItem } from "../lib/locations/schema";

const base: LocationItem = {
  id: "test-loc",
  active: true,
  type: "restaurant",
  sortOrder: 0,
  name: "Test",
  label: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  hours: "",
  phone: "",
  email: "",
  status: "Open",
  statusNote: "Note",
  mapsUrl: "",
  embedUrl: "",
  lat: null,
  lng: null,
  lastUpdated: "",
};

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Tuesday 2:28 AM CDT (2025-04-29 07:28 UTC)
const tueEarly = new Date("2025-04-29T07:28:00.000Z");
let s = getLocationPublicStatus(base, tueEarly);
assert(s.label === "Closed" && s.detail.includes("5:00 PM"), `Tue 2:28 AM: got ${JSON.stringify(s)}`);

// Saturday 10:30 AM CDT (2025-05-03 15:30 UTC ≈ 10:30 CDT)
const satMorning = new Date("2025-05-03T15:30:00.000Z");
s = getLocationPublicStatus(base, satMorning);
assert(
  s.label === "Open" && s.detail.includes("Desayuno de Fin de Semana"),
  `Sat 10:30 AM: got ${JSON.stringify(s)}`,
);

// Saturday 4:30 PM CDT (2025-05-03 21:30 UTC)
const satGap = new Date("2025-05-03T21:30:00.000Z");
s = getLocationPublicStatus(base, satGap);
assert(
  s.label === "Closed" && s.detail.includes("Regular Menu") && s.detail.includes("today"),
  `Sat 4:30 PM gap: got ${JSON.stringify(s)}`,
);

// Saturday 7:00 PM CDT (2025-05-04T00:00:00.000Z) — 7pm CDT = midnight UTC next calendar day in Chicago; use explicit offset-safe instant:
// 2025-05-03 19:00 Chicago = 2025-05-04 00:00 UTC
const satEvening = new Date("2025-05-04T00:00:00.000Z");
s = getLocationPublicStatus(base, satEvening);
assert(
  s.label === "Open" && s.detail.includes("Regular Menu") && s.detail.includes("11:00 PM"),
  `Sat 7:00 PM: got ${JSON.stringify(s)}`,
);

console.log("validate-location-hours: all checks passed.");
