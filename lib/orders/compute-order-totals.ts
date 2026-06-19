import { getMenuCatalog } from "@/lib/menu/get-menu";
import { computeLineUnitPriceDollars } from "@/lib/menu/line-price";
import {
  itemRequiresOptionSelections,
  optionSelectionsComplete,
} from "@/lib/menu/option-groups";
import type { MenuItem } from "@/lib/menu/schema";
import { priceDollarsToCents } from "@/lib/menu/schema";
import {
  ORDER_DELIVERY_FEE_CENTS,
  ORDER_MAX_LINE_QUANTITY,
  ORDER_MAX_TIP_CENTS,
  ORDER_TAX_RATE,
} from "@/lib/orders/pricing-constants";
import type { CartLine, FulfillmentType } from "@/lib/types/order";

export type ComputedOrderTotals = {
  items: CartLine[];
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  deliveryFeeCents: number;
  totalCents: number;
};

export type ValidateOrderTotalsInput = {
  items: CartLine[];
  fulfillment: FulfillmentType;
  tipCents: number;
  /** Square checkout requires every line to have a confirmed menu price. */
  requireAllPriced: boolean;
  clientTotals?: {
    subtotalCents: number;
    taxCents: number;
    deliveryFeeCents: number;
    totalCents: number;
  };
};

export type ValidateOrderTotalsResult =
  | { ok: true; totals: ComputedOrderTotals }
  | { ok: false; error: string };

function optionValuesAllowed(item: MenuItem, sel?: Record<string, string | string[]>): boolean {
  if (!sel || Object.keys(sel).length === 0) return true;
  for (const [groupId, val] of Object.entries(sel)) {
    const group = item.optionGroups?.find((g) => g.id === groupId);
    if (!group) return false;
    const values = Array.isArray(val) ? val : [val];
    for (const raw of values) {
      const trimmed = typeof raw === "string" ? raw.trim() : "";
      if (!trimmed || !group.options.includes(trimmed)) return false;
    }
  }
  return true;
}

function totalsMatch(a: number, b: number, toleranceCents = 1): boolean {
  return Math.abs(a - b) <= toleranceCents;
}

/**
 * Recompute order totals from the live menu catalog and validate cart lines.
 * Server totals are authoritative for Square charges.
 */
export async function validateAndComputeOrderTotals(
  input: ValidateOrderTotalsInput,
): Promise<ValidateOrderTotalsResult> {
  const catalog = await getMenuCatalog();
  const menuById = new Map(catalog.items.map((item) => [item.id, item]));

  const pricedLines: CartLine[] = [];
  let hasUnpricedLine = false;

  for (const line of input.items) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { ok: false, error: "Invalid item quantity" };
    }
    if (line.quantity > ORDER_MAX_LINE_QUANTITY) {
      return { ok: false, error: `Quantity cannot exceed ${ORDER_MAX_LINE_QUANTITY} per item` };
    }

    const menuItem = menuById.get(line.menuItemId);
    if (!menuItem) {
      return { ok: false, error: `Unknown menu item: ${line.menuItemId}` };
    }

    if (itemRequiresOptionSelections(menuItem) && !optionSelectionsComplete(menuItem, line.selectedOptions ?? {})) {
      return { ok: false, error: `Missing required options for ${menuItem.name}` };
    }

    if (!optionValuesAllowed(menuItem, line.selectedOptions)) {
      return { ok: false, error: `Invalid options for ${menuItem.name}` };
    }

    const unitPriceUsd = computeLineUnitPriceDollars(
      menuItem,
      line.selectedMeat,
      line.selectedOptions,
    );
    const unitPriceCents = priceDollarsToCents(unitPriceUsd);

    if (unitPriceCents === null) {
      hasUnpricedLine = true;
      if (input.requireAllPriced) {
        return { ok: false, error: `Cannot charge while ${menuItem.name} has pending pricing` };
      }
    }

    pricedLines.push({
      ...line,
      name: menuItem.name,
      unitPriceCents,
    });
  }

  const subtotalCents = pricedLines.reduce((sum, line) => {
    if (line.unitPriceCents === null) return sum;
    return sum + line.unitPriceCents * line.quantity;
  }, 0);

  const deliveryFeeCents =
    input.fulfillment === "delivery" ? ORDER_DELIVERY_FEE_CENTS : 0;

  const taxCents =
    hasUnpricedLine && !input.requireAllPriced
      ? 0
      : Math.round((subtotalCents + deliveryFeeCents) * ORDER_TAX_RATE);

  let tipCents = input.tipCents;
  if (!Number.isFinite(tipCents) || tipCents < 0) {
    return { ok: false, error: "Invalid tip amount" };
  }
  tipCents = Math.round(tipCents);

  if (hasUnpricedLine && !input.requireAllPriced) {
    tipCents = 0;
  } else if (tipCents > ORDER_MAX_TIP_CENTS) {
    return { ok: false, error: "Tip amount exceeds maximum allowed" };
  }

  const totalCents = subtotalCents + deliveryFeeCents + taxCents + tipCents;

  const totals: ComputedOrderTotals = {
    items: pricedLines,
    subtotalCents,
    taxCents,
    tipCents,
    deliveryFeeCents,
    totalCents,
  };

  if (input.clientTotals) {
    const { clientTotals } = input;
    if (!totalsMatch(clientTotals.subtotalCents, subtotalCents)) {
      return { ok: false, error: "Order subtotal mismatch — refresh and try again" };
    }
    if (!totalsMatch(clientTotals.deliveryFeeCents, deliveryFeeCents)) {
      return { ok: false, error: "Delivery fee mismatch — refresh and try again" };
    }
    if (!totalsMatch(clientTotals.taxCents, taxCents)) {
      return { ok: false, error: "Tax mismatch — refresh and try again" };
    }
    if (!totalsMatch(clientTotals.totalCents, totalCents)) {
      return { ok: false, error: "Order total mismatch — refresh and try again" };
    }
  }

  return { ok: true, totals };
}
