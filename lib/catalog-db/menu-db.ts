import type { MenuItem } from "@/lib/menu/schema";
import { parseOptionGroupsJson } from "@/lib/menu/google-sheet-menu";
import { getSql } from "@/lib/db/sql";
import { ensureCatalogTables } from "@/lib/catalog-db/ensure-tables";

type MenuRow = {
  id: string;
  active: boolean;
  category: string;
  section: string | null;
  sort_order: number;
  name: string;
  english_name: string | null;
  description: string | null;
  price: string | number | null;
  includes_fries: boolean;
  meat_choice_required: boolean;
  featured: boolean;
  image_url: string | null;
  image_alt: string | null;
  availability_label: string | null;
  option_groups_json: string | null;
};

function optionGroupsToJson(item: MenuItem): string | null {
  if (!item.optionGroups?.length) return null;
  try {
    return JSON.stringify(item.optionGroups);
  } catch {
    return null;
  }
}

function rowToMenuItem(r: MenuRow): MenuItem {
  const rawPrice = r.price;
  const priceNum =
    rawPrice === null || rawPrice === ""
      ? null
      : typeof rawPrice === "number"
        ? rawPrice
        : Number(rawPrice);
  const price = priceNum != null && Number.isFinite(priceNum) ? priceNum : null;
  return {
    id: r.id,
    active: r.active,
    category: r.category,
    section: r.section ?? undefined,
    sortOrder: r.sort_order,
    name: r.name,
    englishName: r.english_name ?? undefined,
    description: r.description ?? undefined,
    price,
    includesFries: r.includes_fries,
    meatChoiceRequired: r.meat_choice_required,
    featured: r.featured,
    imageUrl: r.image_url ?? undefined,
    imageAlt: r.image_alt ?? undefined,
    availabilityLabel: r.availability_label ?? undefined,
    optionGroups: r.option_groups_json
      ? parseOptionGroupsJson(r.option_groups_json)
      : undefined,
  };
}

export async function countMenuItems(): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  if (!(await ensureCatalogTables())) return 0;
  const rows = await sql<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM menu_items`;
  return rows[0]?.c ?? 0;
}

export async function dbGetMenuItems(includeInactive: boolean): Promise<MenuItem[]> {
  const sql = getSql();
  if (!sql) return [];
  if (!(await ensureCatalogTables())) return [];

  const rows = includeInactive
    ? await sql<MenuRow[]>`
        SELECT
          id,
          active,
          category,
          section,
          sort_order,
          name,
          english_name,
          description,
          price,
          includes_fries,
          meat_choice_required,
          featured,
          image_url,
          image_alt,
          availability_label,
          option_groups_json
        FROM menu_items
        ORDER BY category ASC, sort_order ASC, name ASC
      `
    : await sql<MenuRow[]>`
        SELECT
          id,
          active,
          category,
          section,
          sort_order,
          name,
          english_name,
          description,
          price,
          includes_fries,
          meat_choice_required,
          featured,
          image_url,
          image_alt,
          availability_label,
          option_groups_json
        FROM menu_items
        WHERE active = true
        ORDER BY category ASC, sort_order ASC, name ASC
      `;

  return rows.map(rowToMenuItem);
}

export async function dbInsertMenuItem(item: MenuItem): Promise<MenuItem | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!(await ensureCatalogTables())) return null;

  const og = optionGroupsToJson(item);
  const rows = await sql<MenuRow[]>`
    INSERT INTO menu_items (
      id,
      active,
      category,
      section,
      sort_order,
      name,
      english_name,
      description,
      price,
      includes_fries,
      meat_choice_required,
      featured,
      image_url,
      image_alt,
      availability_label,
      option_groups_json
    )
    VALUES (
      ${item.id},
      ${item.active},
      ${item.category},
      ${item.section ?? null},
      ${item.sortOrder},
      ${item.name},
      ${item.englishName ?? null},
      ${item.description ?? null},
      ${item.price},
      ${item.includesFries},
      ${item.meatChoiceRequired},
      ${item.featured},
      ${item.imageUrl ?? null},
      ${item.imageAlt ?? null},
      ${item.availabilityLabel ?? null},
      ${og}
    )
    RETURNING
      id,
      active,
      category,
      section,
      sort_order,
      name,
      english_name,
      description,
      price,
      includes_fries,
      meat_choice_required,
      featured,
      image_url,
      image_alt,
      availability_label,
      option_groups_json
  `;
  return rows[0] ? rowToMenuItem(rows[0]) : null;
}

export async function dbUpdateMenuItem(
  id: string,
  patch: Partial<MenuItem>,
): Promise<MenuItem | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!(await ensureCatalogTables())) return null;

  const existing = await sql<MenuRow[]>`
    SELECT
      id,
      active,
      category,
      section,
      sort_order,
      name,
      english_name,
      description,
      price,
      includes_fries,
      meat_choice_required,
      featured,
      image_url,
      image_alt,
      availability_label,
      option_groups_json
    FROM menu_items
    WHERE id = ${id}
  `;
  const base = existing[0];
  if (!base) return null;

  const cur = rowToMenuItem(base);
  const next: MenuItem = {
    ...cur,
    ...patch,
    optionGroups: patch.optionGroups !== undefined ? patch.optionGroups : cur.optionGroups,
  };

  const og = optionGroupsToJson(next);

  const out = await sql<MenuRow[]>`
    UPDATE menu_items
    SET
      active = ${next.active},
      category = ${next.category},
      section = ${next.section ?? null},
      sort_order = ${next.sortOrder},
      name = ${next.name},
      english_name = ${next.englishName ?? null},
      description = ${next.description ?? null},
      price = ${next.price},
      includes_fries = ${next.includesFries},
      meat_choice_required = ${next.meatChoiceRequired},
      featured = ${next.featured},
      image_url = ${next.imageUrl ?? null},
      image_alt = ${next.imageAlt ?? null},
      availability_label = ${next.availabilityLabel ?? null},
      option_groups_json = ${og},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      active,
      category,
      section,
      sort_order,
      name,
      english_name,
      description,
      price,
      includes_fries,
      meat_choice_required,
      featured,
      image_url,
      image_alt,
      availability_label,
      option_groups_json
  `;
  return out[0] ? rowToMenuItem(out[0]) : null;
}

export async function dbDeleteMenuItem(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (!(await ensureCatalogTables())) return false;
  const result = await sql`
    DELETE FROM menu_items WHERE id = ${id}
  `;
  return result.count > 0;
}
