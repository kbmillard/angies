import type { ScheduleItem } from "./schema";

export type CurrentScheduleStatus = {
  isOpen: boolean;
  currentLocation: ScheduleItem | null;
  nextOpening: ScheduleItem | null;
};

/**
 * Determines if the truck is currently open based on active schedule entries.
 * Checks current time in America/Chicago against all active entries for today.
 */
export function getCurrentScheduleStatus(scheduleEntries: ScheduleItem[]): CurrentScheduleStatus {
  // Get current date/time in Chicago timezone
  const now = new Date();
  const chicagoTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  
  const chicagoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
  }).format(now);
  
  const chicagoDayOfWeek = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Chicago" })
  ).getDay();

  const currentTimeMinutes = parseTimeToMinutes(chicagoTime);

  // Filter to active entries for today (either by dayOfWeek or by date)
  const todayEntries = scheduleEntries.filter((entry) => {
    if (!entry.active) return false;
    
    // Check if entry matches today by dayOfWeek (recurring schedule)
    if (entry.dayOfWeek !== undefined && entry.dayOfWeek !== null) {
      return entry.dayOfWeek === chicagoDayOfWeek;
    }
    
    // Check if entry matches today by date (one-time event)
    if (entry.date) {
      return entry.date === chicagoDate;
    }
    
    return false;
  });

  // Sort by start time
  const sortedEntries = todayEntries.sort((a, b) => {
    const aStart = parseTimeToMinutes(a.startTime);
    const bStart = parseTimeToMinutes(b.startTime);
    return aStart - bStart;
  });

  // Find current open location
  for (const entry of sortedEntries) {
    const startMinutes = parseTimeToMinutes(entry.startTime);
    const endMinutes = parseTimeToMinutes(entry.endTime);
    
    if (currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes) {
      return {
        isOpen: true,
        currentLocation: entry,
        nextOpening: null,
      };
    }
  }

  // Not currently open - find next opening
  const nextOpening = sortedEntries.find((entry) => {
    const startMinutes = parseTimeToMinutes(entry.startTime);
    return currentTimeMinutes < startMinutes;
  });

  return {
    isOpen: false,
    currentLocation: null,
    nextOpening: nextOpening || null,
  };
}

/**
 * Parse time string (HH:MM or H:MM) to minutes since midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}
