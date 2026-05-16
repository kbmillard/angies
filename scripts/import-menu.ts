#!/usr/bin/env npx tsx
/**
 * Import finalized menu JSON into Postgres (relational catalog).
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/import-menu.ts ./path/to/menu.json
 *
 * Truncates catalog_menu_* tables and re-inserts from the file.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { importMenuFromJsonString } from "../lib/catalog-db/menu-relational-db";

async function main() {
  const file = process.argv[2];
  if (!file?.trim()) {
    console.error("Usage: npx tsx scripts/import-menu.ts <menu.json>");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  const json = await readFile(abs, "utf8");
  const result = await importMenuFromJsonString(json);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
