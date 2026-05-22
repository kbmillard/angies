"use client";

import { Check, MapPin, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { CartLine, FulfillmentType, PickupLocationId } from "@/lib/types/order";

type OrderConfirmationProps = {
  orderId: string;
  customerEmail?: string;
  requestedTime: string;
  pickupLocation?: PickupLocationId;
  fulfillment: FulfillmentType;
  items: CartLine[];
  totalCents: number;
  onClose: () => void;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function OrderConfirmation({
  orderId,
  customerEmail,
  requestedTime,
  pickupLocation,
  fulfillment,
  items,
  totalCents,
  onClose,
}: OrderConfirmationProps) {
  // Get pickup location text
  const locationText =
    fulfillment === "delivery"
      ? "Delivery to your address"
      : pickupLocation === "restaurant"
        ? "Pickup at Restaurant"
        : "Pickup at the Truck";

  // Format estimated time (add 30 min buffer to requested time for now)
  // TODO: Pull from schedule when schedule API is integrated
  const estimatedTime = requestedTime;

  return (
    <div className="flex h-full flex-col">
      {/* Success Hero */}
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
          You&apos;re all set!
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

      {/* Details */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
        {/* Email Confirmation */}
        {customerEmail && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 rounded-2xl border border-agave/30 bg-agave/5 p-4"
          >
            <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-agave" />
            <div>
              <p className="font-semibold text-cream">Confirmation sent</p>
              <p className="mt-1 text-sm text-cream/70">{customerEmail}</p>
            </div>
          </motion.div>
        )}

        {/* Pickup Location & Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-angie-orange" />
            <div>
              <p className="font-semibold text-cream">{locationText}</p>
              <p className="mt-1 text-sm text-cream/70">
                {/* TODO: Pull actual address from schedule based on requestedTime */}
                Use the Current Truck Location on the site for today&apos;s address
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-white/10 pt-3">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-angie-orange" />
            <div>
              <p className="font-semibold text-cream">Estimated pickup</p>
              <p className="mt-1 text-sm text-cream/70">{estimatedTime}</p>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <h3 className="mb-3 font-semibold text-cream">Your order</h3>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-cream/80">
                  {item.quantity}x {item.name}
                  {item.selectedMeat && (
                    <span className="text-cream/60"> ({item.selectedMeat})</span>
                  )}
                </span>
                <span className="text-cream">
                  {item.unitPriceCents !== null
                    ? formatMoney(item.unitPriceCents * item.quantity)
                    : "TBD"}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
            <span className="text-cream">Total</span>
            <span className="text-cream">{formatMoney(totalCents)}</span>
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-cream/60"
        >
          Thank you for your order! We&apos;ll have it ready for you soon.
        </motion.p>
      </div>

      {/* Close Button */}
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
