import { randomUUID } from "node:crypto";
import type { MenuItem, MenuOptionGroup } from "@/lib/menu/schema";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asBool(v: unknown, def: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  return def;
}

export function parseMenuItemForAdmin(
  body: unknown,
  opts: { idOptional: boolean },
): { ok: true; item: MenuItem } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const o = body as Record<string, unknown>;

  let id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
  if (!id) {
    if (!opts.idOptional) return { ok: false, error: "id required" };
    id = randomUUID();
  }

  const name = typeof o.name === "string" ? o.name.trim() : "";
  const category = typeof o.category === "string" ? o.category.trim() : "";
  if (!name) return { ok: false, error: "name required" };
  if (!category) return { ok: false, error: "category required" };

  const sortN =
    typeof o.sortOrder === "number"
      ? o.sortOrder
      : typeof o.sortOrder === "string"
        ? Number(o.sortOrder)
        : 0;
  const sortOrder = Number.isFinite(sortN) ? sortN : 0;

  let price: number | null = null;
  if (o.price === null || o.price === "") {
    price = null;
  } else if (typeof o.price === "number" && Number.isFinite(o.price)) {
    price = o.price;
  } else if (typeof o.price === "string" && o.price.trim()) {
    const n = Number(o.price.replace(/[$,]/g, ""));
    price = Number.isFinite(n) ? n : null;
  }

  let optionGroups: MenuOptionGroup[] | undefined;
  if (Array.isArray(o.optionGroups)) {
    optionGroups = o.optionGroups as MenuOptionGroup[];
  }

  let meatOptionPrices: Record<string, number> | undefined;
  if (isRecord(o.meatOptionPrices)) {
    meatOptionPrices = {};
    for (const [k, v] of Object.entries(o.meatOptionPrices)) {
      if (!k.trim()) continue;
      const n =
        typeof v === "number" && Number.isFinite(v)
          ? v
          : typeof v === "string"
            ? Number(v.replace(/[$,]/g, ""))
            : NaN;
      if (Number.isFinite(n)) meatOptionPrices[k.trim()] = n;
    }
    if (Object.keys(meatOptionPrices).length === 0) meatOptionPrices = undefined;
  }

  const item: MenuItem = {
    id,
    active: asBool(o.active, true),
    category,
    section: typeof o.section === "string" && o.section.trim() ? o.section.trim() : undefined,
    sortOrder,
    name,
    englishName:
      typeof o.englishName === "string" && o.englishName.trim()
        ? o.englishName.trim()
        : undefined,
    description:
      typeof o.description === "string" && o.description.trim() ? o.description.trim() : undefined,
    price,
    includesFries: asBool(o.includesFries, false),
    meatChoiceRequired: asBool(o.meatChoiceRequired, false),
    featured: asBool(o.featured, false),
    imageUrl: typeof o.imageUrl === "string" && o.imageUrl.trim() ? o.imageUrl.trim() : undefined,
    imageAlt: typeof o.imageAlt === "string" && o.imageAlt.trim() ? o.imageAlt.trim() : undefined,
    availabilityLabel:
      typeof o.availabilityLabel === "string" && o.availabilityLabel.trim()
        ? o.availabilityLabel.trim()
        : undefined,
    optionGroups,
    meatOptionPrices,
  };

  return { ok: true, item };
}
