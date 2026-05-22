import type { ScheduleItem } from "@/lib/schedule/schema";
import { getCurrentScheduleStatus } from "@/lib/schedule/current-status";
import { getNextWeeklyStop } from "@/lib/schedule/next-weekly-stop";
import { scheduleLineAddress } from "@/lib/schedule/schedule-ui-helpers";

export const PICKUP_READY_MESSAGE =
  "Online orders are typically ready 15 minutes after checkout";

const CHICAGO_TZ = "America/Chicago";
const READY_BUFFER_MINUTES = 15;

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function chicagoNow(now: Date = new Date()): { minutes: number; date: Date } {
  const chicagoDate = new Date(now.toLocaleString("en-US", { timeZone: CHICAGO_TZ }));
  const chicagoTime = new Intl.DateTimeFormat("en-US", {
    timeZone: CHICAGO_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  return {
    minutes: parseTimeToMinutes(chicagoTime),
    date: chicagoDate,
  };
}

function formatMinutes12h(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;
  return `${hour12}:${mins.toString().padStart(2, "0")} ${period}`;
}

function formatTimeString12h(timeStr: string): string {
  return formatMinutes12h(parseTimeToMinutes(timeStr));
}

function formatDateTimeChicago(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CHICAGO_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export type PickupLocationResolved = {
  locationName: string;
  address: string;
  scheduleEntry: ScheduleItem | null;
};

/** Current truck location if open, otherwise next scheduled stop. */
export function resolvePickupLocation(
  scheduleItems: ScheduleItem[],
): PickupLocationResolved {
  const status = getCurrentScheduleStatus(scheduleItems);

  if (status.isOpen && status.currentLocation) {
    const entry = status.currentLocation;
    return {
      locationName: entry.locationName,
      address: scheduleLineAddress(entry),
      scheduleEntry: entry,
    };
  }

  const next = getNextWeeklyStop(scheduleItems);
  if (next) {
    return {
      locationName: next.entry.locationName,
      address: scheduleLineAddress(next.entry),
      scheduleEntry: next.entry,
    };
  }

  return {
    locationName: "Pickup at the truck",
    address: "Use the Current Truck Location on the site for today's address",
    scheduleEntry: null,
  };
}

/** Slot sent to API/Telegram when customer picks Earliest. */
export function resolveEarliestPickupSlot(
  scheduleItems: ScheduleItem[],
  now: Date = new Date(),
): string {
  const status = getCurrentScheduleStatus(scheduleItems);
  const { minutes: nowMinutes } = chicagoNow(now);

  if (status.isOpen && status.currentLocation) {
    const entry = status.currentLocation;
    const startMinutes = parseTimeToMinutes(entry.startTime);
    const endMinutes = parseTimeToMinutes(entry.endTime);
    const readyMinutes = nowMinutes + READY_BUFFER_MINUTES;
    const clamped = Math.min(Math.max(readyMinutes, startMinutes), endMinutes - 1);
    return formatMinutes12h(clamped);
  }

  const next = getNextWeeklyStop(scheduleItems);
  if (next) {
    return `${next.dayName} · ${formatTimeString12h(next.entry.startTime)}`;
  }

  return "Earliest available";
}

/** Estimated ready time shown on confirmation (checkout + 15 min). */
export function computeEstimatedPickupAt(completedAt: Date = new Date()): string {
  const readyAt = new Date(completedAt.getTime() + READY_BUFFER_MINUTES * 60 * 1000);
  return formatDateTimeChicago(readyAt);
}
