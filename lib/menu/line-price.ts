import type { MenuItem } from "./schema";
import type { OptionSelections } from "./option-groups";

const ADDITIVE_SURCHARGE_RE = /\(\+\s*\$?\s*([\d]+(?:\.\d{1,2})?)\s*\)/i;

/** Surcharge from labels like "Rice (+$3.00)" — not meat totals like "Lengua — $14.00". */
export function parseAdditiveSurchargeDollars(optionLabel: string): number {
  const m = optionLabel.match(ADDITIVE_SURCHARGE_RE);
  if (!m) return 0;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : 0;
}

function normMeat(m?: string): string {
  return (m ?? "").trim();
}

/**
 * Unit price in dollars for one cart line (base or meat total + optional add-on surcharges).
 * Returns null when the item has no confirmed base price and meat pricing cannot be resolved.
 */
export function computeLineUnitPriceDollars(
  item: MenuItem,
  selectedMeat?: string,
  selectedOptions?: OptionSelections,
): number | null {
  const sel = selectedOptions ?? {};
  const meatFromOptions =
    typeof sel.meat === "string" ? sel.meat.trim() : "";
  const meatKey = normMeat(selectedMeat) || meatFromOptions;

  const meatFromTable =
    meatKey && item.meatOptionPrices?.[meatKey] != null
      ? item.meatOptionPrices[meatKey]!
      : null;

  let total: number | null;
  if (meatFromTable !== null) {
    total = meatFromTable;
  } else if (item.price !== null && item.price !== undefined) {
    total = item.price;
    if (meatKey) total += parseAdditiveSurchargeDollars(meatKey);
  } else {
    return null;
  }

  const meatPricedViaTable = meatFromTable !== null;

  for (const [groupId, val] of Object.entries(sel)) {
    if (groupId === "meat" && meatPricedViaTable) continue;
    const values = Array.isArray(val)
      ? val.map((x) => x.trim()).filter(Boolean)
      : typeof val === "string" && val.trim()
        ? [val.trim()]
        : [];
    for (const opt of values) {
      if (groupId === "meat" && meatPricedViaTable) continue;
      total += parseAdditiveSurchargeDollars(opt);
    }
  }

  return Math.round(total * 100) / 100;
}
