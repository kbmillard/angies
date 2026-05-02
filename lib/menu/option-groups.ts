import type { MenuItem, MenuOptionGroup } from "./schema";

export function itemRequiresOptionSelections(item: MenuItem): boolean {
  return Boolean(item.optionGroups?.some((g) => g.required));
}

export function optionSelectionsComplete(
  item: MenuItem,
  sel: Record<string, string>,
): boolean {
  for (const g of item.optionGroups ?? []) {
    if (!g.required) continue;
    const v = sel[g.id]?.trim();
    if (!v || !g.options.includes(v)) return false;
  }
  return true;
}

export function selectionsKey(sel?: Record<string, string>): string {
  if (!sel || Object.keys(sel).length === 0) return "";
  const keys = Object.keys(sel).sort();
  return JSON.stringify(keys.map((k) => [k, sel[k] ?? ""]));
}

export function formatOptionLine(group: MenuOptionGroup, value: string): string {
  return `${group.label}: ${value}`;
}
