import type { WeeklyHours } from "./hours";

/** Canonical Angie’s truck hours (America/Chicago) — matches footer + owner spec. */
export const ANGIES_TRUCK_WEEKLY_HOURS: WeeklyHours = {
  mon: [{ open: "10:00", close: "14:00", label: "Service" }],
  tue: [{ open: "10:00", close: "14:00", label: "Service" }],
  wed: [{ open: "10:00", close: "20:00", label: "Service" }],
  thu: [{ open: "10:00", close: "20:00", label: "Service" }],
  fri: [{ open: "10:00", close: "20:00", label: "Service" }],
  sat: [{ open: "10:00", close: "16:00", label: "Service" }],
};

export const ANGIES_TRUCK_WEEKLY_HOURS_JSON = JSON.stringify(ANGIES_TRUCK_WEEKLY_HOURS);

export const ANGIES_TRUCK_HOURS_DISPLAY =
  "Mon–Tue 10 AM–2 PM · Wed–Fri 10 AM–8 PM · Sat 10 AM–4 PM";
