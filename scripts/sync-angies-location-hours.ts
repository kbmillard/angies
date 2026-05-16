/**
 * Push canonical truck hours to Postgres (location_items.weekly_hours_json).
 * Run: npx tsx scripts/sync-angies-location-hours.ts
 */
import {
  ANGIES_TRUCK_HOURS_DISPLAY,
  ANGIES_TRUCK_WEEKLY_HOURS_JSON,
} from "../lib/locations/angies-truck-hours";
import { dbGetLocationItems, dbUpdateLocationItem } from "../lib/catalog-db/location-db";

const TRUCK_ID = "angies-food-truck-linwood";

async function main() {
  const items = await dbGetLocationItems(true);
  const truck = items.find((i) => i.id === TRUCK_ID || i.type === "food_truck");
  if (!truck) {
    console.error("No food truck row in location_items — import locations first.");
    process.exit(1);
  }

  const next = {
    ...truck,
    hours: ANGIES_TRUCK_HOURS_DISPLAY,
    weeklyHoursJson: ANGIES_TRUCK_WEEKLY_HOURS_JSON,
    timezone: truck.timezone?.trim() || "America/Chicago",
  };

  const updated = await dbUpdateLocationItem(truck.id, {
    hours: next.hours,
    weeklyHoursJson: next.weeklyHoursJson,
    timezone: next.timezone,
  });
  if (!updated) {
    console.error("Update failed — check DATABASE_URL.");
    process.exit(1);
  }

  console.log(`Updated ${next.id}: weekly hours + display string.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
