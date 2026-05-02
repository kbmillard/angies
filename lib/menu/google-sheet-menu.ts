import type { MenuItem, MenuOptionGroup } from "./schema";
import { parseCsvRows } from "./csv-utils";

function parseBool(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return v === "true" || v === "yes" || v === "1" || v === "y";
}

function parsePriceCell(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t.replace(/[$,]/g, ""));
  if (Number.isNaN(n)) return null;
  return n;
}

function slugId(category: string, name: string) {
  const base = `${category}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, 96) || `item-${Math.random().toString(36).slice(2, 8)}`;
}

function parseOptionGroupsJson(raw: string): MenuOptionGroup[] | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  try {
    const parsed = JSON.parse(t) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    const out: MenuOptionGroup[] = [];
    for (const el of parsed) {
      if (!el || typeof el !== "object") continue;
      const o = el as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id.trim() : "";
      const label = typeof o.label === "string" ? o.label.trim() : "";
      const required = Boolean(o.required);
      const options = Array.isArray(o.options)
        ? o.options.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : [];
      if (!id || !label || options.length === 0) continue;
      out.push({ id, label, required, options });
    }
    return out.length ? out : undefined;
  } catch {
    return undefined;
  }
}

export function parseMenuFromCsvText(csvText: string): MenuItem[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];

  const header = rows[0]!.map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iActive = idx("active");
  const iCat = idx("category");
  const iSection = idx("section");
  const iSort = idx("sortorder");
  const iName = idx("name");
  const iEnglish = idx("englishname");
  const iDesc = idx("description");
  const iPrice = idx("price");
  const iFries = idx("includesfries");
  const iMeat = idx("meatchoicerequired");
  const iFeat = idx("featured");
  const iImg = idx("imageurl");
  const iAlt = idx("imagealt");
  const iAvail = idx("availabilitylabel");
  const iOptJson = idx("optiongroupsjson");
  const iId = idx("id");

  if (iCat < 0 || iName < 0) return [];

  const items: MenuItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    if (row.every((c) => c === "")) continue;

    const category = (row[iCat] ?? "").trim();
    const name = (row[iName] ?? "").trim();
    if (!category || !name) continue;

    const active = iActive < 0 ? true : parseBool(row[iActive] ?? "TRUE");
    if (!active) continue;

    const sortOrder = iSort >= 0 ? Number(row[iSort] ?? "0") || 0 : 0;
    const description = iDesc >= 0 ? (row[iDesc] ?? "").trim() || undefined : undefined;
    const price = iPrice >= 0 ? parsePriceCell(row[iPrice] ?? "") : null;
    const includesFries = iFries >= 0 ? parseBool(row[iFries] ?? "FALSE") : false;
    const meatChoiceRequired = iMeat >= 0 ? parseBool(row[iMeat] ?? "FALSE") : false;
    const featured = iFeat >= 0 ? parseBool(row[iFeat] ?? "FALSE") : false;
    const imageUrl =
      iImg >= 0 && (row[iImg] ?? "").trim() ? (row[iImg] ?? "").trim() : undefined;
    const imageAlt = iAlt >= 0 ? (row[iAlt] ?? "").trim() || undefined : undefined;
    const section = iSection >= 0 ? (row[iSection] ?? "").trim() || undefined : undefined;
    const englishName = iEnglish >= 0 ? (row[iEnglish] ?? "").trim() || undefined : undefined;
    const availabilityLabel =
      iAvail >= 0 ? (row[iAvail] ?? "").trim() || undefined : undefined;
    const optionGroupsRaw = iOptJson >= 0 ? (row[iOptJson] ?? "").trim() : "";
    const optionGroups = optionGroupsRaw ? parseOptionGroupsJson(optionGroupsRaw) : undefined;
    const id =
      iId >= 0 && (row[iId] ?? "").trim()
        ? (row[iId] ?? "").trim()
        : slugId(category, name);

    const item: MenuItem = {
      id,
      active: true,
      category,
      sortOrder,
      name,
      description,
      price,
      includesFries,
      meatChoiceRequired,
      featured,
      imageUrl,
    };
    if (section) item.section = section;
    if (englishName) item.englishName = englishName;
    if (imageAlt) item.imageAlt = imageAlt;
    if (availabilityLabel) item.availabilityLabel = availabilityLabel;
    if (optionGroups?.length) item.optionGroups = optionGroups;

    items.push(item);
  }

  return items;
}
