/**
 * Parses natural language time ranges into 24-hour HH:mm format.
 * 
 * Supported formats:
 * - "10am-2pm" → { startTime: "10:00", endTime: "14:00" }
 * - "10:00 AM to 2:00 PM" → { startTime: "10:00", endTime: "14:00" }
 * - "5:30pm - 8pm" → { startTime: "17:30", endTime: "20:00" }
 * - "10-2" → { startTime: "10:00", endTime: "14:00" }
 */

export type TimeRangeResult = {
  valid: boolean;
  startTime: string; // HH:mm format (24-hour)
  endTime: string;   // HH:mm format (24-hour)
  displayText: string; // Formatted for display (12-hour with AM/PM)
  error?: string;
};

/**
 * Parse a single time string like "10am", "2:30pm", "14:00", "10"
 */
function parseSingleTime(timeStr: string): { hours: number; minutes: number } | null {
  const normalized = timeStr.trim().toLowerCase();
  
  // Match patterns like: 10:30am, 2:30 pm, 14:00, 10am, 10, 2:30
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]; // 'am' or 'pm' or undefined

  // Validate
  if (hours < 0 || hours > 23 || minutes < 0 || minutes >= 60) return null;

  // Handle AM/PM
  if (period) {
    if (hours === 12) {
      // 12am = 0, 12pm = 12
      hours = period === 'am' ? 0 : 12;
    } else if (period === 'pm') {
      hours += 12;
    }
    // am doesn't change hours (except for 12am)
  }

  return { hours, minutes };
}

/**
 * Format hours and minutes to HH:mm (24-hour)
 */
function formatTime24(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format hours and minutes to 12-hour format with AM/PM
 */
function formatTime12(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
  return `${displayHours}${displayMinutes} ${period}`;
}

/**
 * Parse a time range string
 */
export function parseTimeRange(input: string): TimeRangeResult {
  const normalized = input.trim();
  
  if (!normalized) {
    return {
      valid: false,
      startTime: '',
      endTime: '',
      displayText: '',
      error: 'Time range is required',
    };
  }

  // Match time range patterns with various separators: -, –, to
  // Examples: "10am-2pm", "10:00 AM to 2:00 PM", "10-2"
  const rangeMatch = normalized.match(/^(.+?)[\s-–]+(?:to[\s-–]+)?(.+?)$/i);
  
  if (!rangeMatch) {
    return {
      valid: false,
      startTime: '',
      endTime: '',
      displayText: '',
      error: 'Invalid format. Try "10am-2pm" or "10:00 AM to 2:00 PM"',
    };
  }

  const startStr = rangeMatch[1].trim();
  const endStr = rangeMatch[2].trim();

  const start = parseSingleTime(startStr);
  const end = parseSingleTime(endStr);

  if (!start) {
    return {
      valid: false,
      startTime: '',
      endTime: '',
      displayText: '',
      error: `Invalid start time: "${startStr}"`,
    };
  }

  if (!end) {
    return {
      valid: false,
      startTime: '',
      endTime: '',
      displayText: '',
      error: `Invalid end time: "${endStr}"`,
    };
  }

  // Convert to minutes for comparison
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (startMinutes >= endMinutes) {
    return {
      valid: false,
      startTime: '',
      endTime: '',
      displayText: '',
      error: 'Start time must be before end time',
    };
  }

  const startTime = formatTime24(start.hours, start.minutes);
  const endTime = formatTime24(end.hours, end.minutes);
  const displayText = `${formatTime12(start.hours, start.minutes)} - ${formatTime12(end.hours, end.minutes)}`;

  return {
    valid: true,
    startTime,
    endTime,
    displayText,
  };
}
