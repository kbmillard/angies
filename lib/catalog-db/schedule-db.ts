import type { ScheduleItem } from "@/lib/schedule/schema";
import { getSql } from "@/lib/db/sql";
import { ensureCatalogTables } from "@/lib/catalog-db/ensure-tables";

type SchedRow = {
  id: string;
  active: boolean;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  location_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  status_note: string;
  maps_url: string;
  lat: number | null;
  lng: number | null;
  description: string;
  featured: boolean;
  sort_order: number;
  timezone: string;
  item_updated_at: string;
};

function rowToSchedule(r: SchedRow): ScheduleItem {
  return {
    id: r.id,
    active: r.active,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    title: r.title,
    locationName: r.location_name,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip,
    status: r.status,
    statusNote: r.status_note,
    mapsUrl: r.maps_url,
    lat: r.lat,
    lng: r.lng,
    description: r.description,
    featured: r.featured,
    sortOrder: r.sort_order,
    timezone: r.timezone,
    updatedAt: r.item_updated_at,
  };
}

export async function countScheduleItems(): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  if (!(await ensureCatalogTables())) return 0;
  const rows = await sql<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM schedule_items`;
  return rows[0]?.c ?? 0;
}

export async function dbGetScheduleItems(includeInactive: boolean): Promise<ScheduleItem[]> {
  const sql = getSql();
  if (!sql) return [];
  if (!(await ensureCatalogTables())) return [];

  const rows = includeInactive
    ? await sql<SchedRow[]>`
        SELECT
          id,
          active,
          date,
          start_time,
          end_time,
          title,
          location_name,
          address,
          city,
          state,
          zip,
          status,
          status_note,
          maps_url,
          lat,
          lng,
          description,
          featured,
          sort_order,
          timezone,
          item_updated_at
        FROM schedule_items
        ORDER BY date ASC, start_time ASC, sort_order ASC
      `
    : await sql<SchedRow[]>`
        SELECT
          id,
          active,
          date,
          start_time,
          end_time,
          title,
          location_name,
          address,
          city,
          state,
          zip,
          status,
          status_note,
          maps_url,
          lat,
          lng,
          description,
          featured,
          sort_order,
          timezone,
          item_updated_at
        FROM schedule_items
        WHERE active = true
        ORDER BY date ASC, start_time ASC, sort_order ASC
      `;

  return rows.map(rowToSchedule);
}

export async function dbInsertScheduleItem(item: ScheduleItem): Promise<ScheduleItem | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!(await ensureCatalogTables())) return null;

  const rows = await sql<SchedRow[]>`
    INSERT INTO schedule_items (
      id,
      active,
      date,
      start_time,
      end_time,
      title,
      location_name,
      address,
      city,
      state,
      zip,
      status,
      status_note,
      maps_url,
      lat,
      lng,
      description,
      featured,
      sort_order,
      timezone,
      item_updated_at
    )
    VALUES (
      ${item.id},
      ${item.active},
      ${item.date},
      ${item.startTime},
      ${item.endTime},
      ${item.title},
      ${item.locationName},
      ${item.address},
      ${item.city},
      ${item.state},
      ${item.zip},
      ${item.status},
      ${item.statusNote},
      ${item.mapsUrl},
      ${item.lat},
      ${item.lng},
      ${item.description},
      ${item.featured},
      ${item.sortOrder},
      ${item.timezone},
      ${item.updatedAt}
    )
    RETURNING
      id,
      active,
      date,
      start_time,
      end_time,
      title,
      location_name,
      address,
      city,
      state,
      zip,
      status,
      status_note,
      maps_url,
      lat,
      lng,
      description,
      featured,
      sort_order,
      timezone,
      item_updated_at
  `;
  return rows[0] ? rowToSchedule(rows[0]) : null;
}

export async function dbUpdateScheduleItem(
  id: string,
  patch: Partial<ScheduleItem>,
): Promise<ScheduleItem | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!(await ensureCatalogTables())) return null;

  const existing = await sql<SchedRow[]>`
    SELECT
      id,
      active,
      date,
      start_time,
      end_time,
      title,
      location_name,
      address,
      city,
      state,
      zip,
      status,
      status_note,
      maps_url,
      lat,
      lng,
      description,
      featured,
      sort_order,
      timezone,
      item_updated_at
    FROM schedule_items
    WHERE id = ${id}
  `;
  const base = existing[0];
  if (!base) return null;
  const cur = rowToSchedule(base);
  const next: ScheduleItem = { ...cur, ...patch };

  const out = await sql<SchedRow[]>`
    UPDATE schedule_items
    SET
      active = ${next.active},
      date = ${next.date},
      start_time = ${next.startTime},
      end_time = ${next.endTime},
      title = ${next.title},
      location_name = ${next.locationName},
      address = ${next.address},
      city = ${next.city},
      state = ${next.state},
      zip = ${next.zip},
      status = ${next.status},
      status_note = ${next.statusNote},
      maps_url = ${next.mapsUrl},
      lat = ${next.lat},
      lng = ${next.lng},
      description = ${next.description},
      featured = ${next.featured},
      sort_order = ${next.sortOrder},
      timezone = ${next.timezone},
      item_updated_at = ${next.updatedAt},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      active,
      date,
      start_time,
      end_time,
      title,
      location_name,
      address,
      city,
      state,
      zip,
      status,
      status_note,
      maps_url,
      lat,
      lng,
      description,
      featured,
      sort_order,
      timezone,
      item_updated_at
  `;
  return out[0] ? rowToSchedule(out[0]) : null;
}

export async function dbDeleteScheduleItem(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (!(await ensureCatalogTables())) return false;
  const result = await sql`
    DELETE FROM schedule_items WHERE id = ${id}
  `;
  return Number(result.count) > 0;
}
