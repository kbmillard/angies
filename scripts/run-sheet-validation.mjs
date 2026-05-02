#!/usr/bin/env node
/**
 * 1) Export Menu + Locations from the customer workbook to tmp/*.csv
 * 2) Run TypeScript validation against app parsers
 *
 * Usage: node scripts/run-sheet-validation.mjs [path/to/workbook.xlsx]
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const xlsx =
  process.argv[2] || path.join(root, "la_hamburguesa_loca_customer_google_sheets.xlsx");
const py = path.join(root, "scripts", "xlsx_export_menu_locations.py");
const ts = path.join(root, "scripts", "validate-google-sheets-data.ts");

execSync(`python3 "${py}" "${xlsx}"`, { cwd: root, stdio: "inherit" });
execSync(`npx tsx "${ts}"`, { cwd: root, stdio: "inherit" });
