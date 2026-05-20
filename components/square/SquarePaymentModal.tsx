"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createSquarePayments, getSquareConfig, loadSquareSdk } from "@/lib/square/loadSquare";
import type { SquareCard } from "@/lib/square/types";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function SquarePaymentModal({ open, onOpenChange }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { setSquareToken, submitOrder, canOpenPayment, totalCents, orderStatus } = useOrder();
  const { configured } = getSquareConfig();

  useEffect(() => {
    if (!open || !mountRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await loadSquareSdk();
        if (cancelled) return;

        const payments = await createSquarePayments();
        if (!payments || cancelled) {
          setMessage("Square is not configured — add application ID and location ID to environment variables.");
          return;
        }

        const card = await payments.card();
        if (cancelled) {
          card.destroy();
          return;
        }

        await card.attach("#square-card-mount");
        cardRef.current = card;
        setReady(true);
        setMessage(null);
      } catch {
        if (!cancelled) {
          setMessage("Could not initialize Square card fields. Check your connection and keys.");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
      setReady(false);
    };
  }, [open]);

  const handlePay = useCallback(async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setMessage(null);

    try {
      const result = await cardRef.current.tokenize();

      if (result.status !== "OK" || !result.token) {
        const errMsg = result.errors?.[0]?.message ?? "Card tokenization failed";
        setMessage(errMsg);
        setBusy(false);
        return;
      }

      setSquareToken(result.token);
      await submitOrder(result.token);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment error");
    } finally {
      setBusy(false);
    }
  }, [busy, setSquareToken, submitOrder]);

  if (!open) return null;

  const submitting = orderStatus === "submitting" || busy;
  const totalLabel = totalCents > 0 ? `$${(totalCents / 100).toFixed(2)}` : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-charcoal p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-cream/60 hover:bg-white/10 hover:text-cream"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl text-cream">Complete payment</h2>
        <p className="mt-2 text-sm text-cream/65">
          {configured
            ? "Square securely tokenizes your card. We never store raw card data."
            : "Card fields are unavailable until Square keys are configured — you can still place an order without charging a card."}
        </p>

        <div className="mt-6">
          <div
            id="square-card-mount"
            ref={mountRef}
            className={cn(
              "min-h-[56px] rounded-xl border border-white/15 bg-black/40 p-4",
              !ready && "flex items-center justify-center text-sm text-cream/50",
            )}
          >
            {!ready && !message && "Loading card fields…"}
          </div>
          {!configured && (
            <p className="mt-3 text-xs text-cream/50">
              Set <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_SQUARE_APPLICATION_ID</code>{" "}
              and <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_SQUARE_LOCATION_ID</code> and
              reload to mount live Square fields.
            </p>
          )}
        </div>

        {message && (
          <p className="mt-4 rounded-xl border border-salsa/30 bg-salsa/10 px-4 py-2 text-sm text-salsa">
            {message}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={submitting || !canOpenPayment || !ready}
            onClick={() => void handlePay()}
            className="flex-1 rounded-full bg-angie-orange py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-sm transition hover:bg-angie-orange/90 disabled:opacity-50"
          >
            {submitting ? "Processing…" : `Pay ${totalLabel}`}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-white/15 px-5 py-3 text-sm text-cream/80 hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
