import type { MenuItem, MenuOptionGroup } from "./schema";

export type OptionSelections = Record<string, string | string[]>;

export function itemRequiresOptionSelections(item: MenuItem): boolean {
  return Boolean(item.optionGroups?.some((g) => g.required));
}

/** Any option groups → open the options modal before add (required or customize-only). */
export function itemOpensOptionsModal(item: MenuItem): boolean {
  return Boolean(item.optionGroups?.length);
}

export function optionSelectionsComplete(item: MenuItem, sel: OptionSelections): boolean {
  for (const g of item.optionGroups ?? []) {
    if (!g.required) continue;
    const v = sel[g.id];
    if (g.multiple) {
      if (!Array.isArray(v) || v.length === 0) return false;
      if (!v.every((x) => typeof x === "string" && g.options.includes(x))) return false;
    } else {
      const s = typeof v === "string" ? v.trim() : "";
      if (!s || !g.options.includes(s)) return false;
    }
  }
  return true;
}

export function selectionsKey(sel?: OptionSelections): string {
  if (!sel || Object.keys(sel).length === 0) return "";
  const keys = Object.keys(sel).sort();
  return JSON.stringify(
    keys.map((k) => {
      const v = sel[k];
      if (Array.isArray(v)) return [k, [...v].map((x) => x.trim()).filter(Boolean).sort().join("|")];
      return [k, typeof v === "string" ? v.trim() : ""];
    }),
  );
}

export function formatOptionLine(group: MenuOptionGroup, value: string | string[]): string {
  const joined = Array.isArray(value)
    ? value.map((x) => x.trim()).filter(Boolean).join(", ")
    : (value ?? "").trim();
  if (!joined) return "";
  return `${group.label}: ${joined}`;
}

/** Drop empty strings / empty arrays before persisting to cart. */
export function sanitizeOptionSelections(sel: OptionSelections): OptionSelections | undefined {
  const out: OptionSelections = {};
  for (const [k, v] of Object.entries(sel)) {
    if (Array.isArray(v)) {
      const arr = v.map((x) => x.trim()).filter(Boolean);
      if (arr.length) out[k] = arr;
    } else if (typeof v === "string" && v.trim()) {
      out[k] = v.trim();
    }
  }
  return Object.keys(out).length ? out : undefined;
}
