import type { ScheduleItem } from "./schema";
import { isRecurringWeeklyEntry } from "./consolidate-weekly-schedule";
import { formatFullDate, formatTimeRange } from "./schedule-ui-helpers";

export type NextWeeklyStop = {
  entry: ScheduleItem;
  dayName: string;
  dateLabel: string;
  timeRange: string;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function chicagoNow(): { dayOfWeek: number; minutes: number; date: Date } {
  const now = new Date();
  const chicagoDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const chicagoTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  return {
    dayOfWeek: chicagoDate.getDay(),
    minutes: parseTimeToMinutes(chicagoTime),
    date: chicagoDate,
  };
}

function chicagoDateString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function dateForNextDay(from: Date, targetDayOfWeek: number, weeksAhead: number): string {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  let delta = targetDayOfWeek - d.getDay();
  if (delta < 0) delta += 7;
  delta += weeksAhead * 7;
  d.setDate(d.getDate() + delta);
  return chicagoDateString(d);
}

/** Next upcoming recurring slot across the week (Chicago time). */
export function getNextWeeklyStop(items: ScheduleItem[]): NextWeeklyStop | null {
  const recurring = items.filter(isRecurringWeeklyEntry);
  if (recurring.length === 0) return null;

  const { dayOfWeek: todayDow, minutes: nowMinutes, date: today } = chicagoNow();
  let best: { entry: ScheduleItem; sortKey: number; dateStr: string } | null = null;

  for (const entry of recurring) {
    const dow = entry.dayOfWeek!;
    const startMin = parseTimeToMinutes(entry.startTime);

    for (let week = 0; week < 2; week++) {
      const daysUntil = dow - todayDow + week * 7;
      if (daysUntil < 0) continue;
      if (daysUntil === 0 && startMin <= nowMinutes) continue;

      const dateStr = dateForNextDay(today, dow, week);
      const sortKey = daysUntil * 1440 + startMin;

      if (!best || sortKey < best.sortKey) {
        best = { entry, sortKey, dateStr };
      }
    }
  }

  if (!best) return null;

  const dow = best.entry.dayOfWeek!;
  return {
    entry: best.entry,
    dayName: DAY_NAMES[dow] ?? "",
    dateLabel: formatFullDate(best.dateStr),
    timeRange: formatTimeRange(best.entry.startTime, best.entry.endTime),
  };
}
