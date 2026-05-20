#!/usr/bin/env tsx
/**
 * Migrate existing location weeklyHoursJson to schedule entries with dayOfWeek.
 * Run once during deployment: npm run migrate:locations-to-schedule
 */

import { getSql } from "../lib/db/sql";
import { ensureCatalogTables } from "../lib/catalog-db/ensure-tables";
import type { LocationItem } from "../lib/locations/schema";
import type { ScheduleItem } from "../lib/schedule/schema";
import { parseWeeklyHoursJson, type DayKey } from "../lib/locations/hours";
import { randomUUID } from "node:crypto";

const DAY_KEY_TO_INDEX: Record<DayKey, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

async function main() {
  const sql = getSql();
  if (!sql) {
    console.error("❌ DATABASE_URL not configured");
    process.exit(1);
  }

  await ensureCatalogTables();

  // Get active locations with weeklyHoursJson
  const locations = await sql<LocationItem[]>`
    SELECT
      id,
      name,
      address,
      city,
      state,
      zip,
      lat,
      lng,
      maps_url,
      timezone,
      weekly_hours_json,
      active,
      type
    FROM location_items
    WHERE active = true
  `;

  if (!locations.length) {
    console.log("✓ No active locations found");
    return;
  }

  console.log(`Found ${locations.length} active location(s)`);

  let totalCreated = 0;

  for (const location of locations) {
    const weeklyHours = parseWeeklyHoursJson(location.weeklyHoursJson);
    if (!weeklyHours) {
      console.log(`  Skipping ${location.name}: no parseable weeklyHoursJson`);
      continue;
    }

    console.log(`\n  Processing ${location.name}...`);

    for (const [dayKey, windows] of Object.entries(weeklyHours)) {
      const dayOfWeek = DAY_KEY_TO_INDEX[dayKey as DayKey];
      if (dayOfWeek === undefined) continue;

      for (let windowIndex = 0; windowIndex < windows.length; windowIndex++) {
        const window = windows[windowIndex];
        if (!window) continue;

        // Check if a schedule entry already exists for this day/location/time
        const existing = await sql<{ id: string }[]>`
          SELECT id FROM schedule_items
          WHERE day_of_week = ${dayOfWeek}
            AND location_name = ${location.name}
            AND start_time = ${window.open}
            AND end_time = ${window.close}
        `;

        if (existing.length > 0) {
          console.log(`    ${dayKey}: ${window.open}-${window.close} already exists, skipping`);
          continue;
        }

        // Create schedule entry
        const entry: Partial<ScheduleItem> = {
          id: randomUUID(),
          active: true,
          dayOfWeek,
          locationName: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          zip: location.zip,
          startTime: window.open,
          endTime: window.close,
          mapsUrl: location.mapsUrl || "",
          lat: location.lat,
          lng: location.lng,
          sortOrder: windowIndex,
          timezone: location.timezone || "America/Chicago",
          updatedAt: new Date().toISOString(),
        };

        await sql`
          INSERT INTO schedule_items (
            id,
            active,
            day_of_week,
            start_time,
            end_time,
            location_name,
            address,
            city,
            state,
            zip,
            maps_url,
            lat,
            lng,
            sort_order,
            timezone,
            item_updated_at
          ) VALUES (
            ${entry.id!},
            ${entry.active!},
            ${entry.dayOfWeek!},
            ${entry.startTime!},
            ${entry.endTime!},
            ${entry.locationName!},
            ${entry.address!},
            ${entry.city!},
            ${entry.state!},
            ${entry.zip!},
            ${entry.mapsUrl!},
            ${entry.lat ?? null},
            ${entry.lng ?? null},
            ${entry.sortOrder!},
            ${entry.timezone!},
            ${entry.updatedAt!}
          )
        `;

        console.log(`    ✓ Created ${dayKey}: ${window.open}-${window.close}`);
        totalCreated++;
      }
    }
  }

  console.log(`\n✓ Migration complete! Created ${totalCreated} schedule entries`);
  console.log("\nNext steps:");
  console.log("  1. Visit /admin#schedule to review the migrated schedule");
  console.log("  2. Test the open/closed status on the homepage");
  console.log("  3. The old location_items table is preserved for rollback");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
