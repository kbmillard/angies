import type { ScheduleItem } from "./schema";
import { formatTimeRange } from "./schedule-ui-helpers";

export type WeekdayRow = {
  dayOfWeek: number;
  label: string;
  timeRange: string;
  entry: ScheduleItem;
};

export type WeeklyLocationGroup = {
  header: string;
  description: string;
  address: string;
  days: WeekdayRow[];
  sampleEntry: ScheduleItem;
  featured: boolean;
};

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Su",
  1: "M",
  2: "T",
  3: "W",
  4: "Th",
  5: "F",
  6: "Sa",
};

export function isRecurringWeeklyEntry(it: ScheduleItem): boolean {
  return (
    it.active &&
    it.dayOfWeek !== undefined &&
    it.dayOfWeek !== null &&
    !it.date?.trim()
  );
}

function locationKey(it: ScheduleItem): string {
  return `${(it.title ?? "").trim()}|${it.locationName.trim()}|${it.address.trim()}`;
}

function sortDayOfWeek(a: number, b: number): number {
  const order = (d: number) => (d === 0 ? 7 : d);
  return order(a) - order(b);
}

/** Only days that have at least one entry in this location group. */
function daysWithEntries(entries: ScheduleItem[]): number[] {
  const days = new Set<number>();
  for (const e of entries) {
    if (e.dayOfWeek != null) days.add(e.dayOfWeek);
  }
  return Array.from(days).sort(sortDayOfWeek);
}

export function formatScheduleAddress(it: ScheduleItem): string {
  const street = it.address?.trim() ?? "";
  const cityPart = [it.city, it.state, it.zip].filter(Boolean).join(" ").trim();

  if (!street) return cityPart;
  if (!cityPart) return street;

  const streetLower = street.toLowerCase();
  const cityLower = it.city?.trim().toLowerCase() ?? "";
  const zip = it.zip?.trim() ?? "";

  if (
    (cityLower && streetLower.includes(cityLower)) ||
    (zip && street.includes(zip))
  ) {
    return street;
  }

  return `${street}, ${cityPart}`;
}

export function consolidateWeeklySchedule(items: ScheduleItem[]): WeeklyLocationGroup[] {
  const recurring = items.filter(isRecurringWeeklyEntry);
  const groups = new Map<string, ScheduleItem[]>();

  for (const entry of recurring) {
    const key = locationKey(entry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  return Array.from(groups.values()).map((groupEntries) => {
    const sample = groupEntries[0]!;
    const header = (sample.title ?? "").trim() || "Angie's Food Truck";
    const description = sample.locationName.trim();
    const daysToShow = daysWithEntries(groupEntries);

    const days: WeekdayRow[] = daysToShow.map((dayOfWeek) => {
      const dayEntries = groupEntries
        .filter((e) => e.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      const timeRange = dayEntries
        .map((e) => formatTimeRange(e.startTime, e.endTime))
        .filter(Boolean)
        .join(", ");

      return {
        dayOfWeek,
        label: WEEKDAY_LABELS[dayOfWeek] ?? "?",
        timeRange: timeRange || "—",
        entry: dayEntries[0]!,
      };
    });

    return {
      header,
      description,
      address: formatScheduleAddress(sample),
      days,
      sampleEntry: sample,
      featured: groupEntries.some((e) => e.featured),
    };
  });
}

export function splitWeeklySchedule(items: ScheduleItem[]): {
  regular: WeeklyLocationGroup[];
  featured: WeeklyLocationGroup[];
} {
  const groups = consolidateWeeklySchedule(items);
  return {
    regular: groups.filter((g) => !g.featured),
    featured: groups.filter((g) => g.featured),
  };
}
