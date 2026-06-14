"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useOrder } from "@/context/OrderContext";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { useScheduleCatalog } from "@/context/ScheduleCatalogContext";
import { formatOptionLine } from "@/lib/menu/option-groups";
import {
  PICKUP_READY_MESSAGE,
  resolveEarliestPickupSlot,
} from "@/lib/orders/pickup-time";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils/cn";
import { useScrollLock } from "@/lib/utils/use-scroll-lock";
import { OrderConfirmation } from "@/components/order/OrderConfirmation";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function linePriceLabel(cents: number | null) {
  if (cents === null) return "TBD";
  return `${formatMoney(cents)} each`;
}

function lineLineTotal(cents: number | null, qty: number) {
  if (cents === null) return "TBD";
  return formatMoney(cents * qty);
}

export function OrderDrawer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { itemsById } = useMenuCatalog();
  const { data: scheduleData } = useScheduleCatalog();
  const scheduleItems = useMemo(
    () => scheduleData?.items ?? [],
    [scheduleData?.items],
  );

  const {
    cart,
    updateQty,
    removeLine,
    fulfillment,
    setFulfillment,
    customer,
    setCustomer,
    requestedTime,
    setRequestedTime,
    orderNotes,
    setOrderNotes,
    tipPreset,
    setTipPreset,
    customTipCents,
    setCustomTipCents,
    subtotalCents,
    taxCents,
    deliveryFeeCents,
    tipCents,
    totalCents,
    orderDrawerOpen,
    setOrderDrawerOpen,
    canSubmitOrder,
    cartHasUnpricedItems,
    orderStatus,
    orderError,
    confirmationId,
    confirmationSnapshot,
    submitOrder,
    dismissConfirmation,
  } = useOrder();

  // Time picker mode
  const [timeMode, setTimeMode] = useState<"earliest" | "custom">("earliest");

  const earliestSlot = useMemo(
    () => resolveEarliestPickupSlot(scheduleItems),
    [scheduleItems],
  );

  const handleEarliestTime = useCallback(() => {
    setTimeMode("earliest");
    setRequestedTime(earliestSlot);
  }, [earliestSlot, setRequestedTime]);

  useEffect(() => {
    if (!orderDrawerOpen) return;
    if (timeMode === "earliest" && !requestedTime.trim()) {
      setRequestedTime(earliestSlot);
    }
  }, [earliestSlot, orderDrawerOpen, requestedTime, setRequestedTime, timeMode]);

  useScrollLock(orderDrawerOpen);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {orderDrawerOpen ? (
        <>
          <motion.button
            key="order-backdrop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close cart"
            className="fixed inset-0 z-[100] touch-none bg-black/60 backdrop-blur-sm sm:bg-black/50"
            onClick={() => setOrderDrawerOpen(false)}
          />
          <motion.aside
            key="order-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[100] flex min-h-0 flex-col rounded-t-3xl border border-white/10 bg-charcoal shadow-2xl",
              "h-[min(92dvh,calc(100dvh-0.5rem))] max-h-[min(92dvh,calc(100dvh-0.5rem))] pb-[env(safe-area-inset-bottom,0px)]",
              "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[min(440px,100%)] sm:rounded-none sm:rounded-l-3xl sm:pb-0",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Order and checkout"
          >
            {/* Show confirmation view if order is confirmed */}
            {confirmationId && confirmationSnapshot ? (
              <OrderConfirmation
                orderId={confirmationId}
                snapshot={confirmationSnapshot}
                onClose={() => {
                  dismissConfirmation();
                  setOrderDrawerOpen(false);
                }}
              />
            ) : (
              <>
                <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pb-4 sm:pt-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <BrandLogo width={48} height={48} />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-editorial text-cream/60">
                        Live order
                      </p>
                      <p className="font-display text-xl text-cream">Your cart</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-cream hover:bg-white/10 sm:h-10 sm:w-10"
                    onClick={() => setOrderDrawerOpen(false)}
                    aria-label="Close cart"
                  >
                    <X className="h-6 w-6 sm:h-5 sm:w-5" />
                  </button>
                </header>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-3 sm:gap-6 sm:px-5 sm:py-5">
              {orderStatus === "error" && orderError ? (
                <p className="rounded-xl border border-angie-orange/35 bg-angie-orange/10 p-3 text-sm text-cream">
                  {orderError}
                </p>
              ) : null}

              {cartHasUnpricedItems && cart.length > 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-cream/80">
                  Final price is confirmed at pickup for items marked pending. You can still send an
                  order request — we will confirm pricing and pickup time.
                </p>
              ) : null}

              <section aria-label="Cart items">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 py-12 text-center text-cream/70">
                    <ShoppingBag className="h-10 w-10 opacity-50" />
                    <p className="text-sm">
                      Add from the menu — your cart updates instantly.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((line) => (
                      <li
                        key={line.id}
                        className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <span className="truncate font-medium text-cream">{line.name}</span>
                            <span
                              className="min-w-[1rem] flex-1 border-b border-dotted border-cream/20"
                              aria-hidden
                            />
                            <span className="shrink-0 text-xs text-cream/70">
                              {linePriceLabel(line.unitPriceCents)}
                            </span>
                          </div>
                          {line.selectedMeat ? (
                            <p className="mt-1 text-xs text-cream/65">{line.selectedMeat}</p>
                          ) : null}
                          {line.selectedOptions && Object.keys(line.selectedOptions).length > 0
                            ? Object.entries(line.selectedOptions).map(([gid, val]) => {
                                const menuItem = itemsById.get(line.menuItemId);
                                const group = menuItem?.optionGroups?.find((g) => g.id === gid);
                                const v = val as string | string[];
                                const labelText = group
                                  ? formatOptionLine(group, v)
                                  : `${gid}: ${Array.isArray(v) ? v.join(", ") : v}`;
                                if (!labelText) return null;
                                return (
                                  <p key={gid} className="mt-1 text-xs text-cream/70">
                                    {labelText}
                                  </p>
                                );
                              })
                            : null}
                          {line.includesFries ? (
                            <span className="mt-1 inline-block rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-editorial text-cream/75">
                              With fries
                            </span>
                          ) : null}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-white/15 p-1.5 hover:bg-white/5"
                              onClick={() => updateQty(line.id, line.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm">{line.quantity}</span>
                            <button
                              type="button"
                              className="rounded-full border border-white/15 p-1.5 hover:bg-white/5"
                              onClick={() => updateQty(line.id, line.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            type="button"
                            className="text-cream/50 hover:text-salsa"
                            onClick={() => removeLine(line.id)}
                            aria-label={`Remove ${line.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <p className="text-sm font-semibold text-cream">
                            {lineLineTotal(line.unitPriceCents, line.quantity)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-editorial text-cream/50">
                  Fulfillment
                </p>
                <div className="flex rounded-full border border-white/10 p-1">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-full py-2 text-xs uppercase tracking-editorial",
                      fulfillment === "pickup"
                        ? "bg-cream text-charcoal"
                        : "text-cream/70",
                    )}
                    onClick={() => setFulfillment("pickup")}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-full py-2 text-xs uppercase tracking-editorial",
                      fulfillment === "delivery"
                        ? "bg-cream text-charcoal"
                        : "text-cream/70",
                    )}
                    onClick={() => setFulfillment("delivery")}
                  >
                    Delivery
                  </button>
                </div>
                {fulfillment === "pickup" ? (
                  <div className="space-y-2">
                    <p className="text-xs text-cream/50">Pickup location</p>
                    <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-cream/85">
                      Pickup at the truck — use the Current Truck Location on the site for
                      today&apos;s pin. Delivery is optional below if you need it.
                    </p>
                  </div>
                ) : null}
                {fulfillment === "delivery" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-xs text-cream/60 sm:col-span-2">
                      Street
                      <input
                        id="checkout-address-line1"
                        name="address-line1"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                        value={customer.addressLine1 ?? ""}
                        onChange={(e) => setCustomer({ addressLine1: e.target.value })}
                        autoComplete="street-address"
                      />
                    </label>
                    <label className="text-xs text-cream/60">
                      City
                      <input
                        id="checkout-address-city"
                        name="address-city"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                        value={customer.city ?? ""}
                        onChange={(e) => setCustomer({ city: e.target.value })}
                        autoComplete="address-level2"
                      />
                    </label>
                    <label className="text-xs text-cream/60">
                      State
                      <input
                        id="checkout-address-state"
                        name="address-state"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                        value={customer.state ?? ""}
                        onChange={(e) => setCustomer({ state: e.target.value })}
                        autoComplete="address-level1"
                      />
                    </label>
                    <label className="text-xs text-cream/60 sm:col-span-2">
                      ZIP
                      <input
                        id="checkout-address-postal"
                        name="address-postal"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                        value={customer.postalCode ?? ""}
                        onChange={(e) => setCustomer({ postalCode: e.target.value })}
                        autoComplete="postal-code"
                      />
                    </label>
                  </div>
                ) : null}
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-cream/60">
                  Name
                  <input
                    id="checkout-customer-name"
                    name="customer-name"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                    value={customer.name}
                    onChange={(e) => setCustomer({ name: e.target.value })}
                    autoComplete="name"
                  />
                </label>
                <label className="text-xs text-cream/60">
                  Phone
                  <input
                    id="checkout-customer-phone"
                    name="customer-phone"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ phone: e.target.value })}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label className="text-xs text-cream/60 sm:col-span-2">
                  Email (optional)
                  <input
                    id="checkout-customer-email"
                    name="customer-email"
                    type="email"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                    value={customer.email ?? ""}
                    onChange={(e) => setCustomer({ email: e.target.value })}
                    autoComplete="email"
                  />
                </label>
                <div className="sm:col-span-2">
                  <label className="text-xs text-cream/60">
                    {fulfillment === "delivery"
                      ? "Requested delivery time"
                      : "Requested pickup time"}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleEarliestTime}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition",
                        timeMode === "earliest"
                          ? "border-angie-orange bg-angie-orange/10 text-angie-orange"
                          : "border-white/10 bg-charcoal text-cream/70 hover:bg-white/5",
                      )}
                    >
                      Earliest
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeMode("custom");
                        if (requestedTime.includes("·") || !requestedTime.includes(":")) {
                          setRequestedTime("");
                        }
                      }}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition",
                        timeMode === "custom"
                          ? "border-angie-orange bg-angie-orange/10 text-angie-orange"
                          : "border-white/10 bg-charcoal text-cream/70 hover:bg-white/5",
                      )}
                    >
                      Custom
                    </button>
                  </div>
                  {timeMode === "custom" ? (
                    <input
                      type="time"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                      value={requestedTime}
                      onChange={(e) => setRequestedTime(e.target.value)}
                    />
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">
                    {PICKUP_READY_MESSAGE}
                  </p>
                </div>
                <label className="text-xs text-cream/60 sm:col-span-2">
                  Order notes (optional)
                  <textarea
                    className="mt-1 min-h-[80px] w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </label>
              </section>

              {!cartHasUnpricedItems ? (
                <section className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-editorial text-cream/50">Tip</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["none", "No tip"],
                        ["15", "15%"],
                        ["18", "18%"],
                        ["20", "20%"],
                        ["custom", "Custom"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs uppercase tracking-editorial",
                          tipPreset === id
                            ? "border-cream bg-cream text-charcoal"
                            : "border-white/15 text-cream/80 hover:bg-white/5",
                        )}
                        onClick={() => setTipPreset(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {tipPreset === "custom" ? (
                    <label className="text-xs text-cream/60">
                      Custom tip (USD)
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                        value={customTipCents / 100}
                        onChange={(e) =>
                          setCustomTipCents(Math.round(Number(e.target.value || 0) * 100))
                        }
                      />
                    </label>
                  ) : null}
                </section>
              ) : null}

              <section className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                {cartHasUnpricedItems ? (
                  <>
                    <Row label="Subtotal" value="—" />
                    <p className="text-xs text-cream/55">
                      Subtotal shown once every item has a confirmed menu price.
                    </p>
                  </>
                ) : (
                  <>
                    <Row label="Subtotal" value={formatMoney(subtotalCents)} />
                    {deliveryFeeCents > 0 ? (
                      <Row label="Delivery" value={formatMoney(deliveryFeeCents)} />
                    ) : null}
                    <Row label="Tax (est.)" value={formatMoney(taxCents)} />
                    <Row label="Tip" value={formatMoney(tipCents)} />
                    <div className="my-2 border-t border-white/10" />
                    <Row label="Total" value={formatMoney(totalCents)} strong />
                  </>
                )}
              </section>
            </div>

            <footer className="shrink-0 space-y-2 border-t border-white/10 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-3 sm:p-4 sm:pb-4">
              <button
                type="button"
                disabled={!canSubmitOrder || orderStatus === "submitting"}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-angie-orange py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-lg transition hover:bg-angie-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => void submitOrder()}
              >
                {orderStatus === "submitting"
                  ? "Sending order…"
                  : cartHasUnpricedItems
                    ? "Send Order Request"
                    : `Send Order · ${formatMoney(totalCents)}`}
              </button>
              {!canSubmitOrder && (
                <p className="text-center text-xs text-cream/50">
                  Add items, name, phone, requested time
                  {fulfillment === "delivery" ? ", and delivery address" : ""} to continue.
                </p>
              )}
            </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "text-cream" : "text-cream/70"}>{label}</span>
      <span className={strong ? "font-semibold text-cream" : "text-cream"}>{value}</span>
    </div>
  );
}
