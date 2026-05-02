import type { LocationItem } from "./schema";

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type DailyHoursWindow = {
  open: string;
  close: string;
  label?: string;
};

export type WeeklyHours = Partial<Record<DayKey, DailyHoursWindow[]>>;

export const DEFAULT_TIMEZONE = "America/Chicago";

/** Empty until a location row ships `weeklyHoursJson` from the sheet. */
export const DEFAULT_WEEKLY_HOURS: WeeklyHours = {};

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const DAY_DISPLAY: Record<DayKey, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

function cloneWeeklyHours(base: WeeklyHours): WeeklyHours {
  const out: WeeklyHours = {};
  for (const d of DAY_KEYS) {
    const arr = base[d];
    if (arr?.length) out[d] = arr.map((w) => ({ ...w }));
  }
  return out;
}

function normalizeDayKey(raw: string): DayKey | null {
  const s = raw.trim().toLowerCase();
  const map: Record<string, DayKey> = {
    sun: "sun",
    sunday: "sun",
    mon: "mon",
    monday: "mon",
    tue: "tue",
    tues: "tue",
    tuesday: "tue",
    wed: "wed",
    weds: "wed",
    wednesday: "wed",
    thu: "thu",
    thur: "thu",
    thurs: "thu",
    thursday: "thu",
    fri: "fri",
    friday: "fri",
    sat: "sat",
    saturday: "sat",
  };
  return map[s] ?? null;
}

function dayKeyToIndex(dk: DayKey): number {
  return DAY_KEYS.indexOf(dk);
}

function addDaysToDayKey(dk: DayKey, n: number): DayKey {
  return DAY_KEYS[(dayKeyToIndex(dk) + n + 7 * 10) % 7]!;
}

export function parseHHmm(raw: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** Parse optional `weeklyHoursJson` from the sheet; returns null if blank or unusable. */
export function parseWeeklyHoursJson(raw: string | undefined): Partial<WeeklyHours> | null {
  if (!raw?.trim()) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;

  const out: Partial<WeeklyHours> = {};

  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const dk = normalizeDayKey(k);
    if (!dk || !Array.isArray(v)) continue;
    const windows: DailyHoursWindow[] = [];
    for (const item of v) {
      if (typeof item !== "object" || item === null) continue;
      const rec = item as Record<string, unknown>;
      const open = String(rec.open ?? "").trim();
      const close = String(rec.close ?? "").trim();
      const labelRaw = rec.label;
      const label =
        labelRaw != null && String(labelRaw).trim() ? String(labelRaw).trim() : undefined;
      const om = parseHHmm(open);
      const cm = parseHHmm(close);
      if (om == null || cm == null) continue;
      if (om >= cm) continue;
      windows.push({ open, close, label });
    }
    if (windows.length) {
      windows.sort((a, b) => (parseHHmm(a.open) ?? 0) - (parseHHmm(b.open) ?? 0));
      out[dk] = windows;
    }
  }

  return Object.keys(out).length ? out : null;
}

export function resolveWeeklyHours(loc: LocationItem): WeeklyHours {
  const merged = cloneWeeklyHours(DEFAULT_WEEKLY_HOURS);
  const partial = parseWeeklyHoursJson(loc.weeklyHoursJson);
  if (!partial) return merged;
  for (const d of DAY_KEYS) {
    const arr = partial[d];
    if (arr?.length) merged[d] = arr.map((w) => ({ ...w }));
  }
  return merged;
}

function formatMinutes12h(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  const minPart = m === 0 ? ":00" : `:${String(m).padStart(2, "0")}`;
  return `${h12}${minPart} ${period}`;
}

function windowLabel(w: DailyHoursWindow): string {
  return w.label?.trim() || "Service";
}

function getZonedDayAndMinutes(date: Date, timeZone: string): { dayKey: DayKey; minutes: number } {
  const tz = timeZone.trim() || DEFAULT_TIMEZONE;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const p of parts) {
      if (p.type !== "literal") map[p.type] = p.value;
    }
    const wd = (map.weekday ?? "").toLowerCase();
    const hour = Number(map.hour);
    const minute = Number(map.minute);
    const dayKey = weekdayShortToDayKey(wd);
    if (!dayKey || !Number.isFinite(hour) || !Number.isFinite(minute)) {
      return getZonedDayAndMinutes(date, DEFAULT_TIMEZONE);
    }
    return { dayKey, minutes: hour * 60 + minute };
  } catch {
    return getZonedDayAndMinutes(date, DEFAULT_TIMEZONE);
  }
}

function weekdayShortToDayKey(wd: string): DayKey | null {
  const head = wd.slice(0, 3);
  const map: Record<string, DayKey> = {
    sun: "sun",
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
  };
  return map[head] ?? null;
}

function getWindowsSorted(weekly: WeeklyHours, dk: DayKey): DailyHoursWindow[] {
  const w = weekly[dk];
  if (!w?.length) return [];
  return [...w].sort((a, b) => (parseHHmm(a.open) ?? 0) - (parseHHmm(b.open) ?? 0));
}

function findActiveWindow(
  weekly: WeeklyHours,
  dayKey: DayKey,
  minutes: number,
): DailyHoursWindow | null {
  for (const win of getWindowsSorted(weekly, dayKey)) {
    const o = parseHHmm(win.open);
    const c = parseHHmm(win.close);
    if (o == null || c == null) continue;
    if (minutes >= o && minutes < c) return win;
  }
  return null;
}

type NextOpening = { dayOffset: number; window: DailyHoursWindow; targetDay: DayKey };

function findNextOpening(
  weekly: WeeklyHours,
  dayKey: DayKey,
  afterMinutes: number,
): NextOpening | null {
  const todaySorted = getWindowsSorted(weekly, dayKey);
  for (const win of todaySorted) {
    const o = parseHHmm(win.open);
    if (o == null) continue;
    if (o > afterMinutes) return { dayOffset: 0, window: win, targetDay: dayKey };
  }
  for (let d = 1; d <= 7; d++) {
    const dk = addDaysToDayKey(dayKey, d);
    const wins = getWindowsSorted(weekly, dk);
    const first = wins[0];
    if (first) {
      const o = parseHHmm(first.open);
      if (o != null) return { dayOffset: d, window: first, targetDay: dk };
    }
  }
  return null;
}

export type PublicHoursStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
  activeWindowLabel?: string;
  timezone: string;
};

function computeFromWeeklyHours(
  weekly: WeeklyHours,
  date: Date,
  timeZone: string,
): PublicHoursStatus {
  const tz = timeZone.trim() || DEFAULT_TIMEZONE;
  const { dayKey, minutes } = getZonedDayAndMinutes(date, tz);
  const active = findActiveWindow(weekly, dayKey, minutes);

  if (active) {
    const closeM = parseHHmm(active.close);
    const wl = windowLabel(active);
    return {
      isOpen: true,
      label: "Open",
      detail: `${wl} until ${closeM != null ? formatMinutes12h(closeM) : active.close}`,
      activeWindowLabel: active.label?.trim() || wl,
      timezone: tz,
    };
  }

  const next = findNextOpening(weekly, dayKey, minutes);
  if (!next) {
    return {
      isOpen: false,
      label: "Closed",
      detail: "",
      timezone: tz,
    };
  }

  const openM = parseHHmm(next.window.open);
  const wl = windowLabel(next.window);
  const timePart = openM != null ? formatMinutes12h(openM) : next.window.open;

  if (next.dayOffset === 0) {
    return {
      isOpen: false,
      label: "Closed",
      detail: `${wl} opens today at ${timePart}`,
      timezone: tz,
    };
  }

  if (next.dayOffset === 1) {
    return {
      isOpen: false,
      label: "Closed",
      detail: `${wl} opens tomorrow at ${timePart}`,
      timezone: tz,
    };
  }

  const dayName = DAY_DISPLAY[next.targetDay];
  return {
    isOpen: false,
    label: "Closed",
    detail: `${wl} opens ${dayName} at ${timePart}`,
    timezone: tz,
  };
}

const SPECIAL_OVERRIDE_STATUSES = new Set(["sold out", "catering event", "moving soon"]);

/**
 * Public-facing hours status for a location.
 * Uses the location IANA `timezone` when computing windows, not the viewer's local zone.
 * Sheet `Open` is ignored for truth; special statuses still override display.
 */
export function getLocationPublicStatus(
  loc: LocationItem,
  now: Date = new Date(),
): PublicHoursStatus {
  const tz = loc.timezone?.trim() || DEFAULT_TIMEZONE;
  const weekly = resolveWeeklyHours(loc);
  const raw = loc.status?.trim() ?? "";
  const norm = raw.toLowerCase();

  if (SPECIAL_OVERRIDE_STATUSES.has(norm)) {
    return {
      isOpen: false,
      label: raw || norm,
      detail: "",
      timezone: tz,
    };
  }

  const computed = computeFromWeeklyHours(weekly, now, tz);

  if (norm === "closed") {
    return {
      isOpen: false,
      label: "Closed",
      detail: computed.detail,
      timezone: tz,
    };
  }

  // "Open", empty, or any other sheet value: hours drive open/closed; label/detail from schedule.
  return computed;
}
