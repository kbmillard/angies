export type ScheduleSource = "google-sheet" | "local-fallback";

export type ScheduleItem = {
  id: string;
  active: boolean;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  statusNote: string;
  mapsUrl: string;
  lat: number | null;
  lng: number | null;
  description: string;
  featured: boolean;
  sortOrder: number;
  timezone: string;
  updatedAt: string;
};

export type ScheduleResponse = {
  items: ScheduleItem[];
  source: ScheduleSource;
  updatedAt: string;
};
