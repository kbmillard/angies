import { getSql } from "@/lib/db/sql";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";

let siteSettingsTableReady = false;

export async function ensureSiteSettingsTable(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (siteSettingsTableReady) return true;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  siteSettingsTableReady = true;
  return true;
}

export async function dbGetSiteSettingsPayload(): Promise<unknown | null> {
  const sql = getSql();
  if (!sql) return null;
  const ok = await ensureSiteSettingsTable();
  if (!ok) return null;

  const rows = await sql<{ payload: unknown }[]>`SELECT payload FROM site_settings WHERE id = 'default'`;
  const raw = rows[0]?.payload;
  return raw ?? null;
}

export async function dbSaveSiteSettingsPayload(payload: SiteSettingsResolved): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL is not configured.");
  await ensureSiteSettingsTable();
  const asJson = JSON.parse(JSON.stringify(payload)) as Parameters<typeof sql.json>[0];
  await sql`
    INSERT INTO site_settings (id, payload, updated_at)
    VALUES ('default', ${sql.json(asJson)}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at
  `;
}
