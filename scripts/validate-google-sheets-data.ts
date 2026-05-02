/**
 * Validates exported Menu + Locations CSV against app parsers and business rules.
 * Run after: python3 scripts/xlsx_export_menu_locations.py [workbook.xlsx]
 *
 * Usage: npx tsx scripts/validate-google-sheets-data.ts [menu.csv] [locations.csv]
 */
import { readFileSync, existsSync } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMenuFromCsvText } from "../lib/menu/google-sheet-menu";
import { parseLocationsFromCsvText } from "../lib/locations/google-sheet-locations";
import { MENU_CATEGORY_META } from "../lib/menu/category-meta";
import { MENU_CATEGORY_ORDER, meatChoices, type MenuItem } from "../lib/menu/schema";
import { itemRequiresOptionSelections } from "../lib/menu/option-groups";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MENU = path.join(ROOT, "tmp", "menu-sheet-test.csv");
const DEFAULT_LOC = path.join(ROOT, "tmp", "locations-sheet-test.csv");

const MAIN_CATEGORY_LABELS = new Set(
  MENU_CATEGORY_META.map((m) => m.label.toLowerCase()),
);
const ALLOWED_IMAGE_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
  "storage.googleapis.com",
]);

const GUISO_OPTIONS = new Set(["Taco", "Burrito", "Gordita Harina", "Gordita Maíz"]);
const CHILAQUILES_OPTIONS = new Set(["Verde", "Rojo"]);

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function warn(msg: string) {
  console.warn(`WARN: ${msg}`);
}

function pass(msg: string) {
  console.log(`OK: ${msg}`);
}

function validateRemoteImageUrl(url: string) {
  if (!url.startsWith("http")) return;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    fail(`Invalid imageUrl URL: ${url.slice(0, 80)}`);
    return;
  }
  if (!ALLOWED_IMAGE_HOSTS.has(host)) {
    warn(
      `imageUrl host "${host}" is not in next.config.ts remotePatterns — next/image may fail until the host is allowlisted.`,
    );
  }
}

function guisoOptionsMatch(groups: NonNullable<MenuItem["optionGroups"]>): boolean {
  const g = groups.find((x) => x.required && x.options.length > 0);
  if (!g) return false;
  const s = new Set(g.options);
  return GUISO_OPTIONS.size === s.size && [...GUISO_OPTIONS].every((o) => s.has(o));
}

function chilaquilesSauceMatch(groups: NonNullable<MenuItem["optionGroups"]>): boolean {
  const g = groups.find((x) => x.required && x.options.some((o) => o === "Verde" || o === "Rojo"));
  if (!g) return false;
  const s = new Set(g.options);
  return CHILAQUILES_OPTIONS.size === s.size && [...CHILAQUILES_OPTIONS].every((o) => s.has(o));
}

function main() {
  const menuPath = process.argv[2] || DEFAULT_MENU;
  const locPath = process.argv[3] || DEFAULT_LOC;

  if (!existsSync(menuPath)) {
    fail(`Menu CSV missing: ${menuPath} (run python3 scripts/xlsx_export_menu_locations.py first)`);
    return;
  }
  if (!existsSync(locPath)) {
    fail(`Locations CSV missing: ${locPath}`);
    return;
  }

  const menuText = readFileSync(menuPath, "utf8");
  const locText = readFileSync(locPath, "utf8");

  const menuRows = parseMenuFromCsvText(menuText);
  const locRows = parseLocationsFromCsvText(locText);

  if (menuRows.length === 0) {
    fail("Menu parser returned zero items — check headers (category + name required).");
    return;
  }
  pass(`Menu: ${menuRows.length} active rows parsed`);

  if (locRows.length === 0) {
    fail("Locations parser returned zero rows — check type + name headers.");
    return;
  }
  pass(`Locations: ${locRows.length} active rows parsed`);

  const headerLine = menuText.split(/\r?\n/)[0] ?? "";
  const requiredMenuHeaders = [
    "id",
    "active",
    "category",
    "section",
    "sortOrder",
    "name",
    "englishName",
    "description",
    "price",
    "includesFries",
    "meatChoiceRequired",
    "featured",
    "imageUrl",
    "imageAlt",
    "availabilityLabel",
    "optionGroupsJson",
  ];
  const menuHeaderCells = headerLine.split(",").map((c) => c.trim().toLowerCase());
  for (const h of requiredMenuHeaders) {
    if (!menuHeaderCells.includes(h.toLowerCase())) {
      fail(`Menu CSV header row missing column: ${h}`);
    }
  }
  pass("Menu header row contains all expected column names (order-independent).");

  const locHeader = locText.split(/\r?\n/)[0] ?? "";
  const requiredLocHeaders = [
    "id",
    "active",
    "type",
    "sortOrder",
    "name",
    "label",
    "address",
    "city",
    "state",
    "zip",
    "hours",
    "phone",
    "email",
    "status",
    "statusNote",
    "mapsUrl",
    "embedUrl",
    "lat",
    "lng",
    "lastUpdated",
  ];
  const locHeaderCells = locHeader.split(",").map((c) => c.trim().toLowerCase());
  for (const h of requiredLocHeaders) {
    if (!locHeaderCells.includes(h.toLowerCase())) {
      fail(`Locations CSV header row missing column: ${h}`);
    }
  }
  pass("Locations header row contains all expected column names.");
  console.log(
    "NOTE: placeId, formattedAddress are optional Sheet columns; geocodeSource/geocodedAt/mapEmbedSrc are server-filled and should not appear in the Sheet.",
  );

  const ids = new Map<string, string>();
  for (const item of menuRows) {
    const prev = ids.get(item.id);
    if (prev) {
      fail(`Duplicate menu id "${item.id}"`);
    }
    ids.set(item.id, item.name);
    if (item.imageUrl) validateRemoteImageUrl(item.imageUrl);
  }
  pass("Menu ids are unique within active rows.");

  for (const item of menuRows) {
    const cat = item.category.trim();
    const catLower = cat.toLowerCase();
    if (catLower === "weekend breakfast") continue;
    if (!MAIN_CATEGORY_LABELS.has(catLower)) {
      fail(`Unknown main menu category "${cat}" on item ${item.id}`);
    }
  }
  pass("Every menu item category is either a main carousel category or Weekend Breakfast.");

  const wb = menuRows.filter((i) => i.category.toLowerCase() === "weekend breakfast");
  const sections = new Set(wb.map((i) => (i.section ?? "").trim()).filter(Boolean));
  for (const s of ["Guisos", "Desayunos", "Caldos"]) {
    if (!sections.has(s)) {
      warn(`Weekend Breakfast has no rows in section "${s}" (optional if menu is incomplete).`);
    }
  }

  const guisos = wb.filter((i) => (i.section ?? "").trim() === "Guisos");
  for (const g of guisos) {
    if (!g.optionGroups?.length || !guisoOptionsMatch(g.optionGroups)) {
      fail(
        `Guisos row "${g.id}" (${g.name}) must have required option group with exactly: Taco, Burrito, Gordita Harina, Gordita Maíz`,
      );
    }
    if (!itemRequiresOptionSelections(g)) {
      fail(`Guisos row "${g.id}" should require option selections (check required + options).`);
    }
  }
  if (guisos.length) pass(`Guisos: ${guisos.length} rows validated (style options).`);

  const ch = wb.find((i) => i.name.toLowerCase().includes("chilaquiles"));
  if (ch) {
    if (!ch.optionGroups?.length || !chilaquilesSauceMatch(ch.optionGroups)) {
      fail(`Chilaquiles row "${ch.id}" must have required sauce options Verde and Rojo.`);
    }
    if (!itemRequiresOptionSelections(ch)) {
      fail(`Chilaquiles row "${ch.id}" should require option selections.`);
    }
    pass("Chilaquiles row has required Verde/Rojo sauce options.");
  } else {
    warn("No Chilaquiles row found under Weekend Breakfast.");
  }

  const locIds = new Set<string>();
  for (const loc of locRows) {
    if (locIds.has(loc.id)) fail(`Duplicate location id "${loc.id}"`);
    locIds.add(loc.id);
  }
  pass("Location ids are unique.");

  const rest = locRows.find((l) => l.type === "restaurant");
  const truck = locRows.find((l) => l.type === "food_truck");
  if (rest?.id !== "restaurant-southwest-blvd") {
    warn(`Restaurant id is "${rest?.id}" (expected restaurant-southwest-blvd for parity with local fallback).`);
  }
  if (truck?.id !== "food-truck-independence-ave") {
    warn(`Food truck id is "${truck?.id}" (expected food-truck-independence-ave for parity with local fallback).`);
  }
  if (rest && rest.address.includes("904 Southwest")) pass("Restaurant address matches expected KC row.");
  if (truck && truck.address.includes("3009 Independence")) pass("Food truck address matches expected KC row.");

  const orderSet = new Set(MENU_CATEGORY_ORDER.map((c) => c.toLowerCase()));
  for (const item of menuRows) {
    if (!orderSet.has(item.category.toLowerCase())) {
      fail(`Category "${item.category}" not in MENU_CATEGORY_ORDER`);
    }
  }
  pass("All categories appear in MENU_CATEGORY_ORDER (includes Weekend Breakfast).");

  console.log(`\nMeat choice list (${meatChoices.length} options) is app-defined in MeatChoiceModal — sheet only sets meatChoiceRequired TRUE/FALSE.`);

  console.log("\nValidation passed. Safe next steps:");
  console.log("- Publish Menu tab as CSV → MENU_CSV_URL");
  console.log("- Publish Locations tab as CSV → LOCATIONS_CSV_URL");
  console.log("- Optional Sheet columns: placeId, formattedAddress (geocodeSource/geocodedAt are server-only).");
}

main();
