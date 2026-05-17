import { readFileSync } from "fs";
import path from "path";
import { relationalPayloadToMenuItems } from "@/lib/catalog-db/menu-relational-db";
import type { ImportedMenuRoot } from "@/lib/menu/import-schema";
import { parseImportedMenuRoot } from "@/lib/menu/import-schema";
import type { MenuItem, MenuOptionGroup } from "@/lib/menu/schema";

const MENU_JSON_PATH = path.join(process.cwd(), "public/menu/menu.json");

const LEGACY_OPTION_GROUP_IDS = new Set(["add", "extra", "substitute"]);

function menuFinalImageForItemSlug(slug: string): { url: string; alt: string } | null {
  const m: Record<string, readonly [file: string, alt: string]> = {
    "street-tacos": ["tacos.png", "Street tacos"],
    "tacos-de-canasta": ["Taco de canasta.png", "Tacos de canasta"],
    "tacos-de-birria": ["Taco birrias.png", "Tacos de birria"],
    "classic-burrito": ["Burrito.png", "Classic burrito"],
    "breakfast-burrito": ["Breakfast burrito.png", "Breakfast burrito"],
    "california-burrito": ["California burrito.png", "California burrito"],
    quesadilla: ["Quesadilla.png", "Quesadilla"],
    quesabirria: ["Quesabirria.png", "Quesabirria"],
    cemita: ["Cemita.png", "Cemita"],
    tostada: ["Tostada.png", "Tostada"],
    chilaquiles: ["Chilaquiles.png", "Chilaquiles"],
  };
  const row = m[slug];
  if (!row) return null;
  const [file, alt] = row;
  return { url: `/menu/menu_final/${encodeURIComponent(file)}`, alt };
}

/** Build runtime menu items from validated `menu.json` (same shape as relational import). */
export function menuItemsFromImportedRoot(root: ImportedMenuRoot): MenuItem[] {
  const { menu } = root;

  const meatMods = menu.globalModifiers.meats.map((m, i) => ({
    id: m.slug,
    kind: "meat" as const,
    slug: m.slug,
    name: m.name,
    amount: m.defaultUpcharge,
    sort_order: i,
  }));

  const sideMods = menu.globalModifiers.sides.map((s, i) => ({
    id: s.slug,
    kind: "side" as const,
    slug: s.slug,
    name: s.name,
    amount: s.price,
    sort_order: i,
  }));

  const toppingMods = menu.globalModifiers.toppings.map((t, i) => ({
    id: t.slug,
    kind: "topping" as const,
    slug: t.slug,
    name: t.name,
    amount: t.price,
    sort_order: i,
  }));

  const itemRows: {
    slug: string;
    category_slug: string;
    category_name: string;
    name: string;
    description: string | null;
    base_price: number;
    requires_meat_selection: boolean;
    sort_order: number;
    active: boolean;
    featured: boolean;
    image_url: string | null;
    image_alt: string | null;
    option_groups_json: string | null;
  }[] = [];

  for (const cat of menu.categories) {
    let itOrd = 0;
    for (const it of cat.items) {
      const art = menuFinalImageForItemSlug(it.slug);
      itemRows.push({
        slug: it.slug,
        category_slug: cat.slug,
        category_name: cat.name,
        name: it.name,
        description: it.description,
        base_price: it.basePrice,
        requires_meat_selection: it.requiresMeatSelection,
        sort_order: itOrd++,
        active: true,
        featured: true,
        image_url: art?.url ?? null,
        image_alt: art?.alt ?? null,
        option_groups_json: null,
      });
    }
  }

  const meatPriceRows: {
    item_slug: string;
    meat_modifier_id: string;
    price: number;
    meat_slug: string;
  }[] = [];

  for (const cat of menu.categories) {
    for (const it of cat.items) {
      if (!it.variantOverrides) continue;
      for (const [meatSlug, price] of Object.entries(it.variantOverrides)) {
        meatPriceRows.push({
          item_slug: it.slug,
          meat_modifier_id: meatSlug,
          meat_slug: meatSlug,
          price,
        });
      }
    }
  }

  return relationalPayloadToMenuItems(meatMods, sideMods, toppingMods, itemRows, meatPriceRows);
}

let cachedBundled: MenuItem[] | null = null;

export function loadBundledMenuItems(): MenuItem[] {
  if (cachedBundled) return cachedBundled;
  const raw = readFileSync(MENU_JSON_PATH, "utf8");
  const root = parseImportedMenuRoot(JSON.parse(raw) as unknown);
  cachedBundled = menuItemsFromImportedRoot(root);
  return cachedBundled;
}

export function usesLegacyOptionGroups(groups: MenuOptionGroup[] | undefined): boolean {
  if (!groups?.length) return false;
  return groups.some((g) => LEGACY_OPTION_GROUP_IDS.has(g.id));
}
