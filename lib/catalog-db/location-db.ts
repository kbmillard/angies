import type { LocationItem, LocationType } from "@/lib/locations/schema";
import { getSql } from "@/lib/db/sql";
import { ensureCatalogTables } from "@/lib/catalog-db/ensure-tables";

type LocRow = {
  id: string;
  active: boolean;
  type: string;
  sort_order: number;
  name: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  phone: string;
  email: string;
  status: string;
  status_note: string;
  maps_url: string;
  embed_url: string;
  lat: number | null;
  lng: number | null;
  last_updated: string;
  timezone: string | null;
  weekly_hours_json: string | null;
  message_board: string | null;
  place_id: string | null;
  formatted_address: string | null;
};

function rowToLocation(r: LocRow): LocationItem {
  const type = (r.type === "restaurant" ? "restaurant" : "food_truck") as LocationType;
  const item: LocationItem = {
    id: r.id,
    active: r.active,
    type,
    sortOrder: r.sort_order,
    name: r.name,
    label: r.label,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip,
    hours: r.hours,
    phone: r.phone,
    email: r.email,
    status: r.status,
    statusNote: r.status_note,
    mapsUrl: r.maps_url,
    embedUrl: r.embed_url,
    lat: r.lat,
    lng: r.lng,
    lastUpdated: r.last_updated,
  };
  if (r.timezone) item.timezone = r.timezone;
  if (r.weekly_hours_json) item.weeklyHoursJson = r.weekly_hours_json;
  if (r.message_board) item.messageBoard = r.message_board;
  if (r.place_id) item.placeId = r.place_id;
  if (r.formatted_address) item.formattedAddress = r.formatted_address;
  return item;
}

export async function countLocationItems(): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  if (!(await ensureCatalogTables())) return 0;
  const rows = await sql<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM location_items`;
  return rows[0]?.c ?? 0;
}

export async function dbGetLocationItems(includeInactive: boolean): Promise<LocationItem[]> {
  const sql = getSql();
  if (!sql) return [];
  if (!(await ensureCatalogTables())) return [];

  const rows = includeInactive
    ? await sql<LocRow[]>`
        SELECT
          id,
          active,
          type,
          sort_order,
          name,
          label,
          address,
          city,
          state,
          zip,
          hours,
          phone,
          email,
          status,
          status_note,
          maps_url,
          embed_url,
          lat,
          lng,
          last_updated,
          timezone,
          weekly_hours_json,
          message_board,
          place_id,
          formatted_address
        FROM location_items
        ORDER BY sort_order ASC, name ASC
      `
    : await sql<LocRow[]>`
        SELECT
          id,
          active,
          type,
          sort_order,
          name,
          label,
          address,
          city,
          state,
          zip,
          hours,
          phone,
          email,
          status,
          status_note,
          maps_url,
          embed_url,
          lat,
          lng,
          last_updated,
          timezone,
          weekly_hours_json,
          message_board,
          place_id,
          formatted_address
        FROM location_items
        WHERE active = true
        ORDER BY sort_order ASC, name ASC
      `;

  return rows.map(rowToLocation);
}

export async function dbInsertLocationItem(item: LocationItem): Promise<LocationItem | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!(await ensureCatalogTables())) return null;

  const rows = await sql<LocRow[]>`
    INSERT INTO location_items (
      id,
      active,
      type,
      sort_order,
      name,
      label,
      address,
      city,
      state,
      zip,
      hours,
      phone,
      email,
      status,
      status_note,
      maps_url,
      embed_url,
      lat,
      lng,
      last_updated,
      timezone,
      weekly_hours_json,
      message_board,
      place_id,
      formatted_address
    )
    VALUES (
      ${item.id},
      ${item.active},
      ${item.type},
      ${item.sortOrder},
      ${item.name},
      ${item.label},
      ${item.address},
      ${item.city},
      ${item.state},
      ${item.zip},
      ${item.hours},
      ${item.phone},
      ${item.email},
      ${item.status},
      ${item.statusNote},
      ${item.mapsUrl},
      ${item.embedUrl},
      ${item.lat},
      ${item.lng},
      ${item.lastUpdated},
      ${item.timezone ?? null},
      ${item.weeklyHoursJson ?? null},
      ${item.messageBoard ?? null},
      ${item.placeId ?? null},
      ${item.formattedAddress ?? null}
    )
    RETURNING
      id,
      active,
      type,
      sort_order,
      name,
      label,
      address,
      city,
      state,
      zip,
      hours,
      phone,
      email,
      status,
      status_note,
      maps_url,
      embed_url,
      lat,
      lng,
      last_updated,
      timezone,
      weekly_hours_json,
      message_board,
      place_id,
      formatted_address
  `;
  return rows[0] ? rowToLocation(rows[0]) : null;
}

export async function dbUpdateLocationItem(
  id: string,
  patch: Partial<LocationItem>,
): Promise<LocationItem | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!(await ensureCatalogTables())) return null;

  const existing = await sql<LocRow[]>`
    SELECT
      id,
      active,
      type,
      sort_order,
      name,
      label,
      address,
      city,
      state,
      zip,
      hours,
      phone,
      email,
      status,
      status_note,
      maps_url,
      embed_url,
      lat,
      lng,
      last_updated,
      timezone,
      weekly_hours_json,
      message_board,
      place_id,
      formatted_address
    FROM location_items
    WHERE id = ${id}
  `;
  const base = existing[0];
  if (!base) return null;
  const cur = rowToLocation(base);
  const next: LocationItem = { ...cur, ...patch };

  const out = await sql<LocRow[]>`
    UPDATE location_items
    SET
      active = ${next.active},
      type = ${next.type},
      sort_order = ${next.sortOrder},
      name = ${next.name},
      label = ${next.label},
      address = ${next.address},
      city = ${next.city},
      state = ${next.state},
      zip = ${next.zip},
      hours = ${next.hours},
      phone = ${next.phone},
      email = ${next.email},
      status = ${next.status},
      status_note = ${next.statusNote},
      maps_url = ${next.mapsUrl},
      embed_url = ${next.embedUrl},
      lat = ${next.lat},
      lng = ${next.lng},
      last_updated = ${next.lastUpdated},
      timezone = ${next.timezone ?? null},
      weekly_hours_json = ${next.weeklyHoursJson ?? null},
      message_board = ${next.messageBoard ?? null},
      place_id = ${next.placeId ?? null},
      formatted_address = ${next.formattedAddress ?? null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      active,
      type,
      sort_order,
      name,
      label,
      address,
      city,
      state,
      zip,
      hours,
      phone,
      email,
      status,
      status_note,
      maps_url,
      embed_url,
      lat,
      lng,
      last_updated,
      timezone,
      weekly_hours_json,
      message_board,
      place_id,
      formatted_address
  `;
  return out[0] ? rowToLocation(out[0]) : null;
}

export async function dbDeleteLocationItem(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (!(await ensureCatalogTables())) return false;
  const result = await sql`
    DELETE FROM location_items WHERE id = ${id}
  `;
  return Number(result.count) > 0;
}
