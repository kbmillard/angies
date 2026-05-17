import { loadBundledMenuItems, usesLegacyOptionGroups } from "./menu-from-import";
import { localMenuItems } from "./local-menu";
import { MENU_CATEGORY_ORDER, type MenuCatalogResponse, type MenuItem } from "./schema";
import { siteCatalogFromDatabase } from "@/lib/catalog-db/config";
import { dbGetMenuItems } from "@/lib/catalog-db/menu-db";
import {
  dbGetRelationalMenuAsMenuItems,
  isRelationalMenuCatalogActive,
} from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

function localCatalogKey(i: MenuItem): string {
  return `${i.category.trim().toLowerCase()}|${i.name.trim().toLowerCase()}`;
}

/** Copy Sides/Toppings/Meat groups from bundled menu.json when DB rows are missing groups or still use legacy Add/Extra/Substitute. */
function mergeOptionGroupsFromLocalDefaults(items: MenuItem[]): MenuItem[] {
  const bundled = loadBundledMenuItems();
  const bundledById = new Map(bundled.map((i) => [i.id, i]));
  const bundledByCatName = new Map(bundled.map((i) => [localCatalogKey(i), i]));
  return items.map((item) => {
    const needsGroups =
      !item.optionGroups?.length || usesLegacyOptionGroups(item.optionGroups);
    if (!needsGroups) return item;
    const base = bundledById.get(item.id) ?? bundledByCatName.get(localCatalogKey(item));
    if (!base?.optionGroups?.length) return item;
    return {
      ...item,
      price: base.price ?? item.price,
      description: base.description ?? item.description,
      meatChoiceRequired: base.meatChoiceRequired,
      optionGroups: base.optionGroups.map((g) => ({
        ...g,
        options: [...g.options],
      })),
      meatOptionPrices: base.meatOptionPrices ?? item.meatOptionPrices,
    };
  });
}

function categoryRank(label: string): number {
  const i = MENU_CATEGORY_ORDER.findIndex(
    (c) => c.toLowerCase() === label.toLowerCase(),
  );
  return i >= 0 ? i : 999;
}

function sortItems(items: MenuItem[]): MenuItem[] {
  return [...items].sort((a, b) => {
    const rc = categoryRank(a.category) - categoryRank(b.category);
    if (rc !== 0) return rc;
    const rs = a.sortOrder - b.sortOrder;
    if (rs !== 0) return rs;
    return a.name.localeCompare(b.name);
  });
}

function buildCatalog(
  items: MenuItem[],
  source: MenuCatalogResponse["source"],
  updatedAt: string,
): MenuCatalogResponse {
  const activeItems = items.filter((i) => i.active);
  const sorted = sortItems(activeItems);
  const categorySet = new Set<string>();
  MENU_CATEGORY_ORDER.forEach((label) => {
    if (sorted.some((i) => i.category.toLowerCase() === label.toLowerCase())) {
      categorySet.add(label);
    }
  });
  sorted.forEach((i) => {
    if (![...categorySet].some((c) => c.toLowerCase() === i.category.toLowerCase())) {
      categorySet.add(i.category);
    }
  });
  const categories = [...categorySet].sort(
    (a, b) => categoryRank(a) - categoryRank(b),
  );
  let featuredItems = sorted.filter((i) => i.featured);
  if (featuredItems.length === 0) {
    featuredItems = sorted.slice(0, 6);
  }
  return {
    categories,
    items: sorted,
    featuredItems,
    source,
    updatedAt,
  };
}

/**
 * Menu: relational Postgres (JSON import) when populated, else legacy `menu_items` when
 * `SITE_DATA_SOURCE=database`, else built-in local fallback. Google Sheet CSV is no longer used.
 */
export async function getMenuCatalog(): Promise<MenuCatalogResponse> {
  const updatedAt = new Date().toISOString();

  if (getSql()) {
    try {
      if (await isRelationalMenuCatalogActive()) {
        const relational = await dbGetRelationalMenuAsMenuItems(false);
        if (relational.length > 0) {
          return buildCatalog(
            mergeOptionGroupsFromLocalDefaults(relational),
            "database",
            updatedAt,
          );
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[menu] Relational catalog read failed:", e);
      }
    }
  }

  if (siteCatalogFromDatabase()) {
    try {
      const fromDb = await dbGetMenuItems(false);
      if (fromDb.length > 0) {
        const merged = mergeOptionGroupsFromLocalDefaults(fromDb);
        return buildCatalog(merged, "database", updatedAt);
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[menu] Legacy database catalog failed, falling back:", e);
      }
    }
  }

  return buildCatalog(localMenuItems, "local-fallback", updatedAt);
}
