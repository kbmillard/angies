import { getSql } from "@/lib/db/sql";

let catalogTablesReady = false;

export async function ensureCatalogTables(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (catalogTablesReady) return true;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      category TEXT NOT NULL,
      section TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      english_name TEXT,
      description TEXT,
      price NUMERIC,
      includes_fries BOOLEAN NOT NULL DEFAULT FALSE,
      meat_choice_required BOOLEAN NOT NULL DEFAULT FALSE,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      image_url TEXT,
      image_alt TEXT,
      availability_label TEXT,
      option_groups_json TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS location_items (
      id TEXT PRIMARY KEY,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      type TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      zip TEXT NOT NULL DEFAULT '',
      hours TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '',
      status_note TEXT NOT NULL DEFAULT '',
      maps_url TEXT NOT NULL DEFAULT '',
      embed_url TEXT NOT NULL DEFAULT '',
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      last_updated TEXT NOT NULL DEFAULT '',
      timezone TEXT,
      weekly_hours_json TEXT,
      message_board TEXT,
      place_id TEXT,
      formatted_address TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS schedule_items (
      id TEXT PRIMARY KEY,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL DEFAULT '',
      end_time TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      location_name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      zip TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '',
      status_note TEXT NOT NULL DEFAULT '',
      maps_url TEXT NOT NULL DEFAULT '',
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      description TEXT NOT NULL DEFAULT '',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order INT NOT NULL DEFAULT 0,
      timezone TEXT NOT NULL DEFAULT 'America/Chicago',
      item_updated_at TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  catalogTablesReady = true;
  return true;
}
