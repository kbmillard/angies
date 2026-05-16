/**
 * Strict shape for the finalized menu JSON (camelCase).
 * Used by the relational Postgres importer and admin JSON upload.
 */

export type ImportedMeatModifier = {
  slug: string;
  name: string;
  defaultUpcharge: number;
};

export type ImportedPricedModifier = {
  slug: string;
  name: string;
  price: number;
};

export type ImportedGlobalModifiers = {
  meats: ImportedMeatModifier[];
  sides: ImportedPricedModifier[];
  toppings: ImportedPricedModifier[];
};

export type ImportedMenuItem = {
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  requiresMeatSelection: boolean;
  variantOverrides?: Record<string, number>;
};

export type ImportedMenuCategory = {
  slug: string;
  name: string;
  items: ImportedMenuItem[];
};

export type ImportedMenuPayload = {
  categories: ImportedMenuCategory[];
  globalModifiers: ImportedGlobalModifiers;
};

export type ImportedMenuRoot = {
  menu: ImportedMenuPayload;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, field: string): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(/[$,]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  throw new Error(`Invalid number for ${field}`);
}

function str(v: unknown, field: string): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  throw new Error(`Invalid string for ${field}`);
}

function parseMeat(o: unknown): ImportedMeatModifier {
  if (!isRecord(o)) throw new Error("Invalid meat modifier");
  return {
    slug: str(o.slug, "meat.slug"),
    name: str(o.name, "meat.name"),
    defaultUpcharge: num(o.defaultUpcharge, "meat.defaultUpcharge"),
  };
}

function parsePriced(o: unknown, kind: string): ImportedPricedModifier {
  if (!isRecord(o)) throw new Error(`Invalid ${kind}`);
  return {
    slug: str(o.slug, `${kind}.slug`),
    name: str(o.name, `${kind}.name`),
    price: num(o.price, `${kind}.price`),
  };
}

function parseItem(o: unknown): ImportedMenuItem {
  if (!isRecord(o)) throw new Error("Invalid menu item");
  const slug = str(o.slug, "item.slug");
  const name = str(o.name, "item.name");
  const description = typeof o.description === "string" ? o.description : "";
  const basePrice = num(o.basePrice, "item.basePrice");
  const requiresMeatSelection = Boolean(o.requiresMeatSelection);
  let variantOverrides: Record<string, number> | undefined;
  if (o.variantOverrides !== undefined) {
    if (!isRecord(o.variantOverrides)) throw new Error("item.variantOverrides must be an object");
    variantOverrides = {};
    for (const [k, v] of Object.entries(o.variantOverrides)) {
      if (!k.trim()) continue;
      variantOverrides[k.trim()] = num(v, `variantOverrides[${k}]`);
    }
    if (Object.keys(variantOverrides).length === 0) variantOverrides = undefined;
  }
  return {
    slug,
    name,
    description,
    basePrice,
    requiresMeatSelection,
    variantOverrides,
  };
}

function parseCategory(o: unknown): ImportedMenuCategory {
  if (!isRecord(o)) throw new Error("Invalid category");
  const slug = str(o.slug, "category.slug");
  const name = str(o.name, "category.name");
  if (!Array.isArray(o.items)) throw new Error("category.items must be an array");
  return {
    slug,
    name,
    items: o.items.map(parseItem),
  };
}

function parseGlobalModifiers(o: unknown): ImportedGlobalModifiers {
  if (!isRecord(o)) throw new Error("Invalid globalModifiers");
  if (!Array.isArray(o.meats)) throw new Error("globalModifiers.meats must be an array");
  if (!Array.isArray(o.sides)) throw new Error("globalModifiers.sides must be an array");
  if (!Array.isArray(o.toppings)) throw new Error("globalModifiers.toppings must be an array");
  return {
    meats: o.meats.map(parseMeat),
    sides: o.sides.map((x) => parsePriced(x, "side")),
    toppings: o.toppings.map((x) => parsePriced(x, "topping")),
  };
}

function parsePayload(o: unknown): ImportedMenuPayload {
  if (!isRecord(o)) throw new Error("Invalid menu payload");
  if (!Array.isArray(o.categories)) throw new Error("menu.categories must be an array");
  return {
    categories: o.categories.map(parseCategory),
    globalModifiers: parseGlobalModifiers(o.globalModifiers),
  };
}

/** Parse and validate unknown JSON from file or HTTP body. */
export function parseImportedMenuRoot(data: unknown): ImportedMenuRoot {
  if (!isRecord(data)) throw new Error("Root must be an object");
  if (!isRecord(data.menu)) throw new Error("Missing menu root");
  return { menu: parsePayload(data.menu) };
}

export function validateVariantOverrideSlugs(payload: ImportedMenuPayload): string[] {
  const meatSlugs = new Set(payload.globalModifiers.meats.map((m) => m.slug));
  const warnings: string[] = [];
  for (const cat of payload.categories) {
    for (const item of cat.items) {
      if (!item.variantOverrides) continue;
      for (const meatSlug of Object.keys(item.variantOverrides)) {
        if (!meatSlugs.has(meatSlug)) {
          warnings.push(
            `Unknown meat slug "${meatSlug}" in variantOverrides for item "${item.slug}" — not in globalModifiers.meats`,
          );
        }
      }
    }
  }
  return warnings;
}
