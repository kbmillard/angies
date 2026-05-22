"use client";

import { Check, MapPin, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatLineDetailLines, stripOptionPrice } from "@/lib/orders/format-line-details";
import type { ConfirmationSnapshot } from "@/lib/types/order";

type OrderConfirmationProps = {
  orderId: string;
  snapshot: ConfirmationSnapshot;
  onClose: () => void;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function OrderConfirmation({ orderId, snapshot, onClose }: OrderConfirmationProps) {
  const {
    customerEmail,
    customerName,
    fulfillment,
    items,
    subtotalCents,
    taxCents,
    tipCents,
    totalCents,
    estimatedPickupAt,
    pickupLocationName,
    pickupAddress,
  } = snapshot;

  const locationTitle =
    fulfillment === "delivery"
      ? "Delivery to your address"
      : pickupLocationName || "Pickup at the truck";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 bg-gradient-to-br from-agave/20 to-agave/5 px-4 py-8 text-center sm:px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-agave shadow-lg shadow-agave/30"
        >
          <Check className="h-10 w-10 text-charcoal" strokeWidth={3} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl text-cream sm:text-4xl"
        >
          You&apos;re all set{customerName ? `, ${customerName.split(" ")[0]}` : ""}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-lg text-cream/80"
        >
          Order #{orderId}
        </motion.p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
        {customerEmail ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-start gap-3 rounded-2xl border border-agave/30 bg-agave/5 p-4"
          >
            <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-agave" />
            <div>
              <p className="font-semibold text-cream">Confirmation email sent</p>
              <p className="mt-1 text-sm text-cream/70">{customerEmail}</p>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-angie-orange" />
            <div>
              <p className="font-semibold text-cream">{locationTitle}</p>
              <p className="mt-1 text-sm text-cream/70">{pickupAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-white/10 pt-3">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-angie-orange" />
            <div>
              <p className="font-semibold text-cream">Estimated pickup</p>
              <p className="mt-1 text-sm text-cream/70">{estimatedPickupAt}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <h3 className="mb-3 font-semibold text-cream">Your order</h3>
          <ul className="space-y-3">
            {items.map((item) => {
              const details = formatLineDetailLines(item);
              return (
                <li key={item.id} className="text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-cream">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="shrink-0 text-cream">
                      {item.unitPriceCents !== null
                        ? formatMoney(item.unitPriceCents * item.quantity)
                        : "TBD"}
                    </span>
                  </div>
                  {details.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 pl-3 text-xs text-cream/65">
                      {details.map((detail) => (
                        <li key={detail}>• {stripOptionPrice(detail.replace(/^Meat: /, ""))}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-sm">
            <div className="flex justify-between text-cream/70">
              <span>Subtotal</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-cream/70">
              <span>Tax</span>
              <span>{formatMoney(taxCents)}</span>
            </div>
            {tipCents > 0 ? (
              <div className="flex justify-between text-cream/70">
                <span>Tip</span>
                <span>{formatMoney(tipCents)}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-1 font-semibold text-cream">
              <span>Total</span>
              <span>{formatMoney(totalCents)}</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center text-sm text-cream/60"
        >
          Thank you for your order! We&apos;ll have it ready for you soon.
        </motion.p>
      </div>

      <div className="flex-shrink-0 border-t border-white/10 p-4 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-agave py-3 text-sm font-semibold uppercase tracking-editorial text-charcoal shadow-lg transition hover:bg-agave/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
