"use client";

import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils/cn";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function cartTotalLabel(
  cartHasUnpricedItems: boolean,
  subtotalCents: number,
  totalCents: number,
): string {
  if (cartHasUnpricedItems) {
    if (subtotalCents > 0) return formatMoney(subtotalCents);
    return "TBD";
  }
  if (totalCents > 0) return formatMoney(totalCents);
  if (subtotalCents > 0) return formatMoney(subtotalCents);
  return "—";
}

export function CartTotalFab() {
  const {
    cart,
    cartHasUnpricedItems,
    subtotalCents,
    totalCents,
    setOrderDrawerOpen,
    orderDrawerOpen,
    paymentModalOpen,
  } = useOrder();

  const itemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );

  const priceLabel = cartTotalLabel(
    cartHasUnpricedItems,
    subtotalCents,
    totalCents,
  );

  const ariaTotal =
    cartHasUnpricedItems && subtotalCents === 0
      ? "total to be determined"
      : `total ${priceLabel}`;

  if (cart.length === 0 || orderDrawerOpen || paymentModalOpen) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setOrderDrawerOpen(true)}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}, ${ariaTotal}`}
      className={cn(
        "fixed right-4 z-[90] flex size-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-full",
        "bg-angie-orange text-cream shadow-lg shadow-black/35",
        "transition hover:bg-angie-orange/90 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <ShoppingBag className="size-4 opacity-90" aria-hidden />
      <span className="max-w-[3.5rem] truncate px-1 text-[11px] font-bold leading-none tracking-tight">
        {priceLabel}
      </span>
      {itemCount > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full border-2 border-charcoal bg-midnight px-1 text-[10px] font-bold leading-none text-cream"
          aria-hidden
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}
