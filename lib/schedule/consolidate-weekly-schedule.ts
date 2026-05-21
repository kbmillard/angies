import type { ScheduleItem } from "./schema";
import { formatTimeRange } from "./schedule-ui-helpers";

export type WeekdayRow = {
  dayOfWeek: number;
  label: string;
  timeRange: string | null;
  entry: ScheduleItem | null;
};

export type WeeklyLocationGroup = {
  header: string;
  description: string;
  addressLine: string;
  cityLine: string;
  days: WeekdayRow[];
  sampleEntry: ScheduleItem;
};

/** Mon–Fri rows; Sat/Sun appended when schedule has entries. */
export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Su",
  1: "M",
  2: "T",
  3: "W",
  4: "Th",
  5: "F",
  6: "Sa",
};

const BASE_DISPLAY_DAYS = [1, 2, 3, 4, 5] as const;

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

function cityLine(it: ScheduleItem): string {
  return [it.city, it.state, it.zip].filter(Boolean).join(" ").trim();
}

function displayDaysForEntries(entries: ScheduleItem[]): number[] {
  const days = new Set<number>(BASE_DISPLAY_DAYS);
  for (const e of entries) {
    if (e.dayOfWeek != null && (e.dayOfWeek === 0 || e.dayOfWeek === 6)) {
      days.add(e.dayOfWeek);
    }
  }
  return Array.from(days).sort((a, b) => {
    const order = (d: number) => (d === 0 ? 7 : d);
    return order(a) - order(b);
  });
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
    const daysToShow = displayDaysForEntries(groupEntries);

    const days: WeekdayRow[] = daysToShow.map((dayOfWeek) => {
      const dayEntries = groupEntries
        .filter((e) => e.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (dayEntries.length === 0) {
        return {
          dayOfWeek,
          label: WEEKDAY_LABELS[dayOfWeek] ?? "?",
          timeRange: null,
          entry: null,
        };
      }

      const timeRange = dayEntries
        .map((e) => formatTimeRange(e.startTime, e.endTime))
        .filter(Boolean)
        .join(", ");

      return {
        dayOfWeek,
        label: WEEKDAY_LABELS[dayOfWeek] ?? "?",
        timeRange: timeRange || null,
        entry: dayEntries[0] ?? null,
      };
    });

    return {
      header,
      description,
      addressLine: sample.address?.trim() ?? "",
      cityLine: cityLine(sample),
      days,
      sampleEntry: sample,
    };
  });
}
