/**
 * Lightweight checks for `getLocationPublicStatus` (America/Chicago).
 * Run: npx tsx scripts/validate-location-hours.ts
 */
import { getLocationPublicStatus } from "../lib/locations/hours";
import type { LocationItem } from "../lib/locations/schema";

const truck: LocationItem = {
  id: "angies-food-truck-linwood",
  active: true,
  type: "food_truck",
  sortOrder: 0,
  name: "Angie's food truck",
  label: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  hours: "",
  phone: "",
  email: "",
  status: "Open",
  statusNote: "",
  mapsUrl: "",
  embedUrl: "",
  lat: null,
  lng: null,
  lastUpdated: "",
  timezone: "America/Chicago",
  weeklyHoursJson:
    '{"wed":[{"open":"10:00","close":"17:00"}],"sat":[{"open":"10:00","close":"17:00"}]}',
};

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Saturday 4:35 PM CDT — after 4:00 PM close
const satAfterClose = new Date("2026-05-16T21:35:00.000Z");
let s = getLocationPublicStatus(truck, satAfterClose);
assert(
  s.label === "Closed" && s.isOpen === false,
  `Sat 4:35 PM should be closed: got ${JSON.stringify(s)}`,
);

// Saturday 11:00 AM CDT — open until 4 PM
const satMorning = new Date("2026-05-16T16:00:00.000Z");
s = getLocationPublicStatus(truck, satMorning);
assert(
  s.label === "Open" && s.detail.includes("4:00 PM"),
  `Sat 11 AM should be open until 4 PM: got ${JSON.stringify(s)}`,
);

// Wednesday 7:30 PM CDT — open until 8 PM
const wedEvening = new Date("2026-05-14T00:30:00.000Z"); // Wed May 13 2026 7:30 PM CDT
s = getLocationPublicStatus(truck, wedEvening);
assert(
  s.label === "Open" && s.detail.includes("8:00 PM"),
  `Wed 7:30 PM should be open: got ${JSON.stringify(s)}`,
);

console.log("validate-location-hours: all checks passed.");
