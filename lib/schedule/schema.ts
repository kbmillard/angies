export type ScheduleSource = "google-sheet" | "local-fallback" | "database";

export type ScheduleItem = {
  id: string;
  active: boolean;
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat (for recurring weekly schedule)
  date?: string; // YYYY-MM-DD (for one-time events, optional)
  startTime: string;
  endTime: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  mapsUrl: string;
  lat: number | null;
  lng: number | null;
  sortOrder: number;
  timezone: string;
  updatedAt: string;
  // Legacy fields (deprecated but kept for backward compat)
  title?: string;
  status?: string;
  statusNote?: string;
  description?: string;
  featured?: boolean;
};

export type ScheduleResponse = {
  items: ScheduleItem[];
  source: ScheduleSource;
  updatedAt: string;
};
