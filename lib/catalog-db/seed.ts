import { localMenuItems } from "@/lib/menu/local-menu";
import { localLocationItems } from "@/lib/locations/local-locations";
import { localScheduleItems } from "@/lib/schedule/local-schedule";
import {
  countMenuItems,
  dbInsertMenuItem,
} from "@/lib/catalog-db/menu-db";
import {
  countLocationItems,
  dbInsertLocationItem,
} from "@/lib/catalog-db/location-db";
import {
  countScheduleItems,
  dbInsertScheduleItem,
} from "@/lib/catalog-db/schedule-db";

/** Copy built-in fallbacks into Postgres (only when tables are empty). */
export async function seedCatalogFromBuiltinsIfEmpty(): Promise<{
  ok: boolean;
  seeded: string[];
  error?: string;
}> {
  const seeded: string[] = [];

  try {
    if ((await countMenuItems()) === 0) {
      for (const item of localMenuItems) {
        await dbInsertMenuItem(item);
      }
      seeded.push("menu");
    }
    if ((await countLocationItems()) === 0) {
      for (const item of localLocationItems) {
        await dbInsertLocationItem(item);
      }
      seeded.push("locations");
    }
    if ((await countScheduleItems()) === 0) {
      for (const item of localScheduleItems) {
        await dbInsertScheduleItem(item);
      }
      seeded.push("schedule");
    }
    return { ok: true, seeded };
  } catch (e) {
    return {
      ok: false,
      seeded,
      error: e instanceof Error ? e.message : "Seed failed",
    };
  }
}
