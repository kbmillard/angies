import { localMenuItems } from "./local-menu";
import { MENU_CATEGORY_ORDER, type MenuCatalogResponse, type MenuItem } from "./schema";
import { parseMenuFromCsvText } from "./google-sheet-menu";

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
 * Menu CSV is cached ~5 minutes via fetch `revalidate: 300`.
 */
export async function getMenuCatalog(): Promise<MenuCatalogResponse> {
  const updatedAt = new Date().toISOString();
  const url = process.env.MENU_CSV_URL ?? process.env.NEXT_PUBLIC_MENU_CSV_URL;

  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`CSV fetch ${res.status}`);
      const text = await res.text();
      const parsed = parseMenuFromCsvText(text);
      if (parsed.length === 0) throw new Error("Parsed zero menu rows");
      return buildCatalog(parsed, "google-sheet", updatedAt);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[menu] Google Sheet / CSV failed, using local fallback:", e);
      }
    }
  }

  return buildCatalog(localMenuItems, "local-fallback", updatedAt);
}
