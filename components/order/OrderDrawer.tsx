"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOrder } from "@/context/OrderContext";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { formatOptionLine } from "@/lib/menu/option-groups";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils/cn";
import { useScrollLock } from "@/lib/utils/use-scroll-lock";

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

/** Centered checkout pop-out — BLUE panel + sky accents */
const panel =
  "border border-sky-400/40 bg-gradient-to-br from-blue-900/95 to-blue-950/95 shadow-2xl shadow-blue-950/60 ring-1 ring-sky-400/20";
const field =
  "rounded-xl border border-sky-400/40 bg-blue-950/60 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30";
const sectionBox = "rounded-2xl border border-sky-400/30 bg-blue-950/50 backdrop-blur-sm";
const pillActive = "border-sky-300 bg-sky-500 text-white shadow-sm shadow-sky-900/50";
const pillIdle = "border-sky-400/30 text-cream/85 hover:border-sky-400/50 hover:bg-sky-500/15";
const btnPrimary =
  "rounded-full bg-sky-500 py-3 text-sm font-semibold uppercase tracking-editorial text-white shadow-lg shadow-sky-900/50 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40";

export function OrderDrawer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { itemsById } = useMenuCatalog();
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
    setPaymentModalOpen,
    canOpenPayment,
    canSendOrderRequest,
    cartHasUnpricedItems,
    orderStatus,
    orderError,
    confirmationId,
    successMessage,
    submitOrderRequest,
  } = useOrder();

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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setOrderDrawerOpen(false)}
          />
          <motion.div
            key="order-panel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "pointer-events-auto fixed left-1/2 top-1/2 z-[100] flex min-h-0 w-[min(520px,92vw)] max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl",
              panel,
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Order and checkout"
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-sky-400/30 bg-blue-900/30 px-4 pb-3 pt-4 sm:px-5 sm:pb-4">
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-400/35 bg-sky-500/10 text-cream hover:bg-sky-500/20 sm:h-10 sm:w-10"
                onClick={() => setOrderDrawerOpen(false)}
                aria-label="Close cart"
              >
                <X className="h-6 w-6 sm:h-5 sm:w-5" />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              {confirmationId ? (
                <div className="rounded-2xl border border-agave/40 bg-agave/10 p-4 text-cream">
                  <p className="font-display text-2xl">You are in.</p>
                  <p className="mt-2 text-sm text-cream/80">
                    Reference{" "}
                    <span className="font-mono text-cream">{confirmationId}</span>
                  </p>
                  {successMessage ? (
                    <p className="mt-2 text-sm text-cream/90">{successMessage}</p>
                  ) : null}
                </div>
              ) : null}

              {orderStatus === "error" && orderError ? (
                <p className="rounded-xl border border-salsa/35 bg-salsa/10 p-3 text-sm text-cream">
                  {orderError}
                </p>
              ) : null}

              {cartHasUnpricedItems && cart.length > 0 ? (
                <p className={cn("p-3 text-xs text-cream/80", sectionBox)}>
                  Final price is confirmed at pickup for items marked pending. You can still send an
                  order request — we will confirm pricing and pickup time.
                </p>
              ) : null}

              <section aria-label="Cart items">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-sky-400/30 py-12 text-center text-cream/70">
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
                        className={cn("flex gap-3 p-3", sectionBox)}
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
                            <span className="mt-1 inline-block rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 text-[10px] uppercase tracking-editorial text-cream/75">
                              With fries
                            </span>
                          ) : null}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-sky-400/30 p-1.5 hover:bg-sky-500/15"
                              onClick={() => updateQty(line.id, line.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm">{line.quantity}</span>
                            <button
                              type="button"
                              className="rounded-full border border-sky-400/30 p-1.5 hover:bg-sky-500/15"
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

              <section className={cn("space-y-3 p-4", sectionBox)}>
                <p className="text-xs uppercase tracking-editorial text-sky-200/80">
                  Fulfillment
                </p>
                <div className="flex rounded-full border border-sky-400/25 p-1">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-full py-2 text-xs uppercase tracking-editorial transition",
                      fulfillment === "pickup" ? pillActive : pillIdle,
                    )}
                    onClick={() => setFulfillment("pickup")}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-full py-2 text-xs uppercase tracking-editorial transition",
                      fulfillment === "delivery" ? pillActive : pillIdle,
                    )}
                    onClick={() => setFulfillment("delivery")}
                  >
                    Delivery
                  </button>
                </div>
                {fulfillment === "pickup" ? (
                  <div className="space-y-2">
                    <p className="text-xs text-cream/55">Pickup location</p>
                    <p className="rounded-xl border border-sky-400/20 bg-[#0a1628]/60 px-3 py-2 text-left text-xs text-cream/85">
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
                        className={cn("mt-1 w-full", field)}
                        value={customer.addressLine1 ?? ""}
                        onChange={(e) => setCustomer({ addressLine1: e.target.value })}
                      />
                    </label>
                    <label className="text-xs text-cream/60">
                      City
                      <input
                        className={cn("mt-1 w-full", field)}
                        value={customer.city ?? ""}
                        onChange={(e) => setCustomer({ city: e.target.value })}
                      />
                    </label>
                    <label className="text-xs text-cream/60">
                      State
                      <input
                        className={cn("mt-1 w-full", field)}
                        value={customer.state ?? ""}
                        onChange={(e) => setCustomer({ state: e.target.value })}
                      />
                    </label>
                    <label className="text-xs text-cream/60 sm:col-span-2">
                      ZIP
                      <input
                        className={cn("mt-1 w-full", field)}
                        value={customer.postalCode ?? ""}
                        onChange={(e) => setCustomer({ postalCode: e.target.value })}
                      />
                    </label>
                  </div>
                ) : null}
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-cream/60">
                  Name
                  <input
                    className={cn("mt-1 w-full", field)}
                    value={customer.name}
                    onChange={(e) => setCustomer({ name: e.target.value })}
                    autoComplete="name"
                  />
                </label>
                <label className="text-xs text-cream/60">
                  Phone
                  <input
                    className={cn("mt-1 w-full", field)}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ phone: e.target.value })}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label className="text-xs text-cream/60 sm:col-span-2">
                  Email (optional)
                  <input
                    className={cn("mt-1 w-full", field)}
                    value={customer.email ?? ""}
                    onChange={(e) => setCustomer({ email: e.target.value })}
                    autoComplete="email"
                  />
                </label>
                <label className="text-xs text-cream/60 sm:col-span-2">
                  {fulfillment === "delivery"
                    ? "Requested delivery time"
                    : "Requested pickup time"}
                  <input
                    className={cn("mt-1 w-full", field)}
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    placeholder={
                      fulfillment === "delivery"
                        ? "Requested delivery time"
                        : "Requested pickup time"
                    }
                  />
                </label>
                <label className="text-xs text-cream/60 sm:col-span-2">
                  Order notes (optional)
                  <textarea
                    className={cn("mt-1 min-h-[80px] w-full", field)}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </label>
              </section>

              {!cartHasUnpricedItems ? (
                <section className={cn("space-y-3 p-4", sectionBox)}>
                  <p className="text-xs uppercase tracking-editorial text-sky-200/80">Tip</p>
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
                          "rounded-full border px-3 py-1.5 text-xs uppercase tracking-editorial transition",
                          tipPreset === id ? pillActive : pillIdle,
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
                        className={cn("mt-1 w-full", field)}
                        value={customTipCents / 100}
                        onChange={(e) =>
                          setCustomTipCents(Math.round(Number(e.target.value || 0) * 100))
                        }
                      />
                    </label>
                  ) : null}
                </section>
              ) : null}

              <section className={cn("space-y-2 p-4 text-sm", sectionBox)}>
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
                    <div className="my-2 border-t border-sky-400/20" />
                    <Row label="Total" value={formatMoney(totalCents)} strong />
                  </>
                )}
              </section>

              {/* TODO: Wire SMS, email, Toast, Square, or POS when replacing mock order routes. */}
            </div>

            <footer className="shrink-0 space-y-3 border-t border-sky-400/30 bg-blue-900/30 p-4 sm:p-5">
              {/* TODO: Replace null prices with confirmed restaurant pricing before enabling real payment checkout. */}
              {cartHasUnpricedItems ? (
                <button
                  type="button"
                  disabled={!canSendOrderRequest}
                  className={cn("flex w-full items-center justify-center gap-2", btnPrimary)}
                  onClick={() => submitOrderRequest()}
                >
                  Send Order Request
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canOpenPayment}
                  className={cn("flex w-full items-center justify-center gap-2", btnPrimary)}
                  onClick={() => setPaymentModalOpen(true)}
                >
                  Pay with card
                </button>
              )}
              {!canSendOrderRequest ? (
                <p className="text-center text-xs text-cream/50">
                  Add items, name, phone, requested time
                  {fulfillment === "delivery" ? ", and delivery address" : ""} to continue.
                </p>
              ) : null}
            </footer>
          </motion.div>
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
