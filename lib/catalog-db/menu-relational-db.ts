import { getSql } from "@/lib/db/sql";
import { ensureRelationalMenuCatalogTables } from "@/lib/catalog-db/ensure-tables";
import type { ImportedMenuRoot } from "@/lib/menu/import-schema";
import { parseImportedMenuRoot, validateVariantOverrideSlugs } from "@/lib/menu/import-schema";
import type { MenuItem, MenuOptionGroup } from "@/lib/menu/schema";

type ModifierRow = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  amount: string | number;
  sort_order: number;
};

type ItemRow = {
  slug: string;
  category_slug: string;
  category_name: string;
  name: string;
  description: string | null;
  base_price: string | number;
  requires_meat_selection: boolean;
  sort_order: number;
  active: boolean;
  featured: boolean;
  image_url: string | null;
  image_alt: string | null;
  option_groups_json: string | null;
};

type MeatPriceRow = {
  item_slug: string;
  meat_modifier_id: string;
  price: string | number;
  meat_slug: string;
};

const MEAT_GROUP_ID = "meat";
const SIDES_GROUP_ID = "sides";
const TOPPINGS_GROUP_ID = "toppings";

function menuFinalImageForItemSlug(slug: string): { url: string; alt: string } | null {
  const m: Record<string, readonly [file: string, alt: string]> = {
    "street-tacos": ["tacos.png", "Street tacos"],
    "tacos-de-canasta": ["Taco de canasta.png", "Tacos de canasta"],
    "tacos-de-birria": ["Taco birrias.png", "Tacos de birria"],
    "classic-burrito": ["Burrito.png", "Classic burrito"],
    "breakfast-burrito": ["Breakfast burrito.png", "Breakfast burrito"],
    "california-burrito": ["California burrito.png", "California burrito"],
    "quesadilla": ["Quesadilla.png", "Quesadilla"],
    "quesabirria": ["Quesabirria.png", "Quesabirria"],
    "cemita": ["Cemita.png", "Cemita"],
    "tostada": ["Tostada.png", "Tostada"],
    "chilaquiles": ["Chilaquiles.png", "Chilaquiles"],
  };
  const row = m[slug];
  if (!row) return null;
  const [file, alt] = row;
  return { url: `/menu/menu_final/${encodeURIComponent(file)}`, alt };
}

export async function countRelationalMenuRows(): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  if (!(await ensureRelationalMenuCatalogTables())) return 0;
  const rows = await sql<{ c: number }[]>`
    SELECT COUNT(*)::int AS c FROM catalog_menu_items
  `;
  return rows[0]?.c ?? 0;
}

export async function isRelationalMenuCatalogActive(): Promise<boolean> {
  return (await countRelationalMenuRows()) > 0;
}

function money(n: string | number | null | undefined): number | null {
  if (n === null || n === undefined || n === "") return null;
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : null;
}

function pricedSideToppingLabel(name: string, priceUsd: number): string {
  if (priceUsd <= 0) return name;
  return `${name} (+$${priceUsd.toFixed(2)})`;
}

/** Meat line in the options modal — shows per-item override total or global upcharge. */
function pricedMeatOptionLabel(
  name: string,
  defaultUpcharge: number,
  itemOverride: number | undefined,
): string {
  if (itemOverride !== undefined) {
    return `${name} — $${itemOverride.toFixed(2)}`;
  }
  if (defaultUpcharge > 0) {
    return `${name} (+$${defaultUpcharge.toFixed(2)})`;
  }
  return name;
}

export function relationalPayloadToMenuItems(
  meats: ModifierRow[],
  sides: ModifierRow[],
  toppings: ModifierRow[],
  items: ItemRow[],
  meatPrices: MeatPriceRow[],
): MenuItem[] {
  const overrideByItemMeat = new Map<string, number>();
  for (const r of meatPrices) {
    const p = money(r.price);
    if (p !== null) overrideByItemMeat.set(`${r.item_slug}\t${r.meat_slug}`, p);
  }

  const sideOptions = sides.map((s) =>
    pricedSideToppingLabel(s.name, money(s.amount) ?? 0),
  );
  const toppingOptions = toppings.map((t) =>
    pricedSideToppingLabel(t.name, money(t.amount) ?? 0),
  );

  const groupsFromGlobals = (): MenuOptionGroup[] => {
    const g: MenuOptionGroup[] = [];
    if (sideOptions.length) {
      g.push({
        id: SIDES_GROUP_ID,
        label: "Sides",
        required: false,
        multiple: true,
        options: sideOptions,
      });
    }
    if (toppingOptions.length) {
      g.push({
        id: TOPPINGS_GROUP_ID,
        label: "Toppings",
        required: false,
        multiple: true,
        options: toppingOptions,
      });
    }
    return g;
  };

  const out: MenuItem[] = [];

  for (const row of items) {
    const base = money(row.base_price);
    const meatMods = [...meats].sort((a, b) => a.sort_order - b.sort_order);

    const meatOptionPrices: Record<string, number> = {};
    const meatOptions: string[] = [];
    for (const m of meatMods) {
      const ov = overrideByItemMeat.get(`${row.slug}\t${m.slug}`);
      const up = money(m.amount) ?? 0;
      const resolved = ov ?? (base !== null ? base + up : null);
      const label = pricedMeatOptionLabel(m.name, up, ov);
      meatOptions.push(label);
      if (resolved !== null) meatOptionPrices[label] = resolved;
    }
    const optionGroups: MenuOptionGroup[] = [...groupsFromGlobals()];

    if (row.requires_meat_selection && meatOptions.length) {
      optionGroups.unshift({
        id: MEAT_GROUP_ID,
        label: "Choose meat",
        required: true,
        options: meatOptions,
      });
    }

    let extra: MenuOptionGroup[] | undefined;
    if (row.option_groups_json?.trim()) {
      try {
        const parsed = JSON.parse(row.option_groups_json) as unknown;
        if (Array.isArray(parsed)) extra = parsed as MenuOptionGroup[];
      } catch {
        /* ignore */
      }
    }
    if (extra?.length) optionGroups.push(...extra);

    const item: MenuItem = {
      id: row.slug,
      active: row.active,
      category: row.category_name,
      sortOrder: row.sort_order,
      name: row.name,
      description: row.description ?? undefined,
      price: base,
      includesFries: false,
      meatChoiceRequired: row.requires_meat_selection,
      featured: row.featured,
      imageUrl: row.image_url ?? undefined,
      imageAlt: row.image_alt ?? undefined,
      optionGroups: optionGroups.length ? optionGroups : undefined,
      meatOptionPrices:
        row.requires_meat_selection && Object.keys(meatOptionPrices).length
          ? meatOptionPrices
          : undefined,
    };

    out.push(item);
  }

  return out;
}

export async function dbGetRelationalMenuAsMenuItems(
  includeInactive: boolean,
): Promise<MenuItem[]> {
  const sql = getSql();
  if (!sql) return [];
  if (!(await ensureRelationalMenuCatalogTables())) return [];

  const meatMods = await sql<ModifierRow[]>`
    SELECT id::text, kind, slug, name, amount, sort_order
    FROM catalog_menu_modifiers
    WHERE kind = 'meat'
    ORDER BY sort_order ASC, id ASC
  `;
  const sideMods = await sql<ModifierRow[]>`
    SELECT id::text, kind, slug, name, amount, sort_order
    FROM catalog_menu_modifiers
    WHERE kind = 'side'
    ORDER BY sort_order ASC, id ASC
  `;
  const toppingMods = await sql<ModifierRow[]>`
    SELECT id::text, kind, slug, name, amount, sort_order
    FROM catalog_menu_modifiers
    WHERE kind = 'topping'
    ORDER BY sort_order ASC, id ASC
  `;

  const itemRows = includeInactive
    ? await sql<ItemRow[]>`
        SELECT
          i.slug,
          i.category_slug,
          c.name AS category_name,
          i.name,
          i.description,
          i.base_price,
          i.requires_meat_selection,
          i.sort_order,
          i.active,
          i.featured,
          i.image_url,
          i.image_alt,
          i.option_groups_json
        FROM catalog_menu_items i
        JOIN catalog_menu_categories c ON c.slug = i.category_slug
        ORDER BY c.sort_order ASC, i.sort_order ASC, i.name ASC
      `
    : await sql<ItemRow[]>`
        SELECT
          i.slug,
          i.category_slug,
          c.name AS category_name,
          i.name,
          i.description,
          i.base_price,
          i.requires_meat_selection,
          i.sort_order,
          i.active,
          i.featured,
          i.image_url,
          i.image_alt,
          i.option_groups_json
        FROM catalog_menu_items i
        JOIN catalog_menu_categories c ON c.slug = i.category_slug
        WHERE i.active = true
        ORDER BY c.sort_order ASC, i.sort_order ASC, i.name ASC
      `;

  const meatPriceRows = await sql<MeatPriceRow[]>`
    SELECT p.item_slug, p.meat_modifier_id::text, p.price, m.slug AS meat_slug
    FROM catalog_menu_item_meat_prices p
    JOIN catalog_menu_modifiers m ON m.id = p.meat_modifier_id AND m.kind = 'meat'
  `;

  return relationalPayloadToMenuItems(meatMods, sideMods, toppingMods, itemRows, meatPriceRows);
}

export type ImportMenuResult = {
  categories: number;
  items: number;
  modifiers: number;
  meatPriceOverrides: number;
  warnings: string[];
};

/** Truncates relational menu tables and inserts from the validated payload (transaction). */
export async function importMenuFromPayload(
  root: ImportedMenuRoot,
): Promise<ImportMenuResult> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL is not configured");
  if (!(await ensureRelationalMenuCatalogTables())) {
    throw new Error("Could not ensure relational menu tables");
  }

  const warnings = validateVariantOverrideSlugs(root.menu);
  const payload = root.menu;

  await sql.begin(async (tx) => {
    await tx`
      TRUNCATE TABLE
        catalog_menu_item_meat_prices,
        catalog_menu_items,
        catalog_menu_categories,
        catalog_menu_modifiers
      RESTART IDENTITY CASCADE
    `;

    let ord = 0;
    for (const m of payload.globalModifiers.meats) {
      await tx`
        INSERT INTO catalog_menu_modifiers (kind, slug, name, amount, sort_order)
        VALUES ('meat', ${m.slug}, ${m.name}, ${m.defaultUpcharge}, ${ord++})
      `;
    }
    ord = 0;
    for (const s of payload.globalModifiers.sides) {
      await tx`
        INSERT INTO catalog_menu_modifiers (kind, slug, name, amount, sort_order)
        VALUES ('side', ${s.slug}, ${s.name}, ${s.price}, ${ord++})
      `;
    }
    ord = 0;
    for (const t of payload.globalModifiers.toppings) {
      await tx`
        INSERT INTO catalog_menu_modifiers (kind, slug, name, amount, sort_order)
        VALUES ('topping', ${t.slug}, ${t.name}, ${t.price}, ${ord++})
      `;
    }

    const meatIdBySlug = new Map(
      (
        await tx<{ id: string; slug: string }[]>`
        SELECT id::text, slug FROM catalog_menu_modifiers WHERE kind = 'meat'
      `
      ).map((r) => [r.slug, r.id]),
    );

    let catOrd = 0;
    for (const cat of payload.categories) {
      await tx`
        INSERT INTO catalog_menu_categories (slug, name, sort_order)
        VALUES (${cat.slug}, ${cat.name}, ${catOrd++})
      `;
      let itOrd = 0;
      for (const it of cat.items) {
        const art = menuFinalImageForItemSlug(it.slug);
        await tx`
          INSERT INTO catalog_menu_items (
            slug,
            category_slug,
            name,
            description,
            base_price,
            requires_meat_selection,
            sort_order,
            active,
            featured,
            image_url,
            image_alt,
            option_groups_json
          )
          VALUES (
            ${it.slug},
            ${cat.slug},
            ${it.name},
            ${it.description},
            ${it.basePrice},
            ${it.requiresMeatSelection},
            ${itOrd++},
            true,
            false,
            ${art?.url ?? null},
            ${art?.alt ?? null},
            null
          )
        `;
      }
    }

    for (const cat of payload.categories) {
      for (const it of cat.items) {
        if (!it.variantOverrides) continue;
        for (const [meatSlug, price] of Object.entries(it.variantOverrides)) {
          const mid = meatIdBySlug.get(meatSlug);
          if (!mid) continue;
          const midNum = Number(mid);
          if (!Number.isFinite(midNum)) continue;
          await tx`
            INSERT INTO catalog_menu_item_meat_prices (item_slug, meat_modifier_id, price)
            VALUES (${it.slug}, ${midNum}, ${price})
          `;
        }
      }
    }
  });

  const modCount = payload.globalModifiers.meats.length +
    payload.globalModifiers.sides.length +
    payload.globalModifiers.toppings.length;
  const itemCount = payload.categories.reduce((s, c) => s + c.items.length, 0);
  let meatPriceOverrides = 0;
  for (const cat of payload.categories) {
    for (const it of cat.items) {
      if (!it.variantOverrides) continue;
      for (const slug of Object.keys(it.variantOverrides)) {
        if (payload.globalModifiers.meats.some((m) => m.slug === slug)) meatPriceOverrides++;
      }
    }
  }

  return {
    categories: payload.categories.length,
    items: itemCount,
    modifiers: modCount,
    meatPriceOverrides,
    warnings,
  };
}

export async function importMenuFromJsonString(json: string): Promise<ImportMenuResult> {
  let data: unknown;
  try {
    data = JSON.parse(json) as unknown;
  } catch {
    throw new Error("Invalid JSON");
  }
  const root = parseImportedMenuRoot(data);
  return importMenuFromPayload(root);
}

export type CatalogMenuItemPatch = {
  name?: string;
  description?: string;
  basePrice?: number;
  requiresMeatSelection?: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
  active?: boolean;
  featured?: boolean;
  sortOrder?: number;
  categorySlug?: string;
};

export type CatalogModifierPatch = {
  name?: string;
  amount?: number;
  sortOrder?: number;
};

export type CatalogModifierRow = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  amount: number;
  sort_order: number;
};

export async function dbListCatalogModifiers(): Promise<CatalogModifierRow[]> {
  const sql = getSql();
  if (!sql) return [];
  if (!(await ensureRelationalMenuCatalogTables())) return [];
  const rows = await sql<
    { id: string; kind: string; slug: string; name: string; amount: string | number; sort_order: number }[]
  >`
    SELECT id::text, kind, slug, name, amount, sort_order
    FROM catalog_menu_modifiers
    ORDER BY kind ASC, sort_order ASC, name ASC
  `;
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    slug: r.slug,
    name: r.name,
    amount: money(r.amount) ?? 0,
    sort_order: r.sort_order,
  }));
}

export async function dbGetItemMeatPrices(
  itemSlug: string,
): Promise<{ meatModifierId: string; meatSlug: string; price: number }[]> {
  const sql = getSql();
  if (!sql) return [];
  if (!(await ensureRelationalMenuCatalogTables())) return [];
  const rows = await sql<
    { meat_modifier_id: string; meat_slug: string; price: string | number }[]
  >`
    SELECT mp.meat_modifier_id::text, m.slug AS meat_slug, mp.price
    FROM catalog_menu_item_meat_prices mp
    JOIN catalog_menu_modifiers m ON m.id = mp.meat_modifier_id
    WHERE mp.item_slug = ${itemSlug}
  `;
  return rows.map((r) => ({
    meatModifierId: r.meat_modifier_id,
    meatSlug: r.meat_slug,
    price: money(r.price) ?? 0,
  }));
}

export async function dbUpdateCatalogMenuItem(
  slug: string,
  patch: CatalogMenuItemPatch,
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (!(await ensureRelationalMenuCatalogTables())) return false;

  const existing = await sql<
    {
      slug: string;
      category_slug: string;
      name: string;
      description: string | null;
      base_price: string | number;
      requires_meat_selection: boolean;
      sort_order: number;
      active: boolean;
      featured: boolean;
      image_url: string | null;
      image_alt: string | null;
    }[]
  >`
    SELECT slug, category_slug, name, description, base_price, requires_meat_selection,
           sort_order, active, featured, image_url, image_alt
    FROM catalog_menu_items WHERE slug = ${slug} LIMIT 1
  `;
  const row = existing[0];
  if (!row) return false;

  const categorySlug = patch.categorySlug ?? row.category_slug;
  if (patch.categorySlug !== undefined) {
    const cat = await sql<{ slug: string }[]>`
      SELECT slug FROM catalog_menu_categories WHERE slug = ${categorySlug} LIMIT 1
    `;
    if (!cat[0]) throw new Error("Unknown category slug");
  }

  const basePrice = patch.basePrice ?? money(row.base_price) ?? 0;

  await sql`
    UPDATE catalog_menu_items
    SET
      category_slug = ${categorySlug},
      name = ${patch.name ?? row.name},
      description = ${patch.description ?? row.description ?? ""},
      base_price = ${basePrice},
      requires_meat_selection = ${patch.requiresMeatSelection ?? row.requires_meat_selection},
      image_url = ${patch.imageUrl !== undefined ? patch.imageUrl : row.image_url},
      image_alt = ${patch.imageAlt !== undefined ? patch.imageAlt : row.image_alt},
      active = ${patch.active ?? row.active},
      featured = ${patch.featured ?? row.featured},
      sort_order = ${patch.sortOrder ?? row.sort_order},
      updated_at = NOW()
    WHERE slug = ${slug}
  `;
  return true;
}

export async function dbUpdateCatalogModifier(
  id: string,
  patch: CatalogModifierPatch,
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (!(await ensureRelationalMenuCatalogTables())) return false;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return false;

  const updated = await sql<{ id: string }[]>`
    UPDATE catalog_menu_modifiers
    SET
      name = COALESCE(${patch.name ?? null}, name),
      amount = COALESCE(${patch.amount ?? null}, amount),
      sort_order = COALESCE(${patch.sortOrder ?? null}, sort_order)
    WHERE id = ${idNum}
    RETURNING id::text
  `;
  return updated.length > 0;
}

export async function dbSetItemMeatPrices(
  itemSlug: string,
  prices: { meatSlug: string; price: number | null }[],
): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL is not configured");
  if (!(await ensureRelationalMenuCatalogTables())) {
    throw new Error("Could not ensure relational menu tables");
  }

  const meats = await sql<{ id: string; slug: string }[]>`
    SELECT id::text, slug FROM catalog_menu_modifiers WHERE kind = 'meat'
  `;
  const meatIdBySlug = new Map(meats.map((m) => [m.slug, m.id]));

  await sql.begin(async (tx) => {
    await tx`DELETE FROM catalog_menu_item_meat_prices WHERE item_slug = ${itemSlug}`;
    for (const row of prices) {
      if (row.price === null || row.price === undefined) continue;
      const mid = meatIdBySlug.get(row.meatSlug);
      if (!mid) continue;
      const midNum = Number(mid);
      if (!Number.isFinite(midNum)) continue;
      await tx`
        INSERT INTO catalog_menu_item_meat_prices (item_slug, meat_modifier_id, price)
        VALUES (${itemSlug}, ${midNum}, ${row.price})
      `;
    }
  });
}
