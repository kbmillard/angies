"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { createSquarePayments, getSquareConfig, loadSquareSdk } from "@/lib/square/loadSquare";
import type { SquareCard } from "@/lib/square/types";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils/cn";
import { useScrollLock } from "@/lib/utils/use-scroll-lock";

/** Card field colors readable on navy modal background */
const SQUARE_CARD_STYLE = {
  ".input-container": {
    borderColor: "rgba(56, 189, 248, 0.45)",
    borderRadius: "12px",
  },
  ".input-container.is-focus": {
    borderColor: "#38bdf8",
  },
  ".input-container.is-error": {
    borderColor: "#f87171",
  },
  input: {
    backgroundColor: "#0a1628",
    color: "#f5f0e8",
    fontSize: "16px",
  },
  "input::placeholder": {
    color: "rgba(245, 240, 232, 0.45)",
  },
  ".message-text": {
    color: "#f87171",
  },
  ".message-icon": {
    color: "#f87171",
  },
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function SquarePaymentModal({ open, onOpenChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { setSquareToken, submitOrder, canOpenPayment, totalCents, orderStatus } = useOrder();
  const { configured } = getSquareConfig();

  useScrollLock(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !mountRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await loadSquareSdk();
        if (cancelled) return;

        const payments = await createSquarePayments();
        if (!payments || cancelled) {
          setMessage(
            "Square is not configured — add application ID and location ID to environment variables.",
          );
          return;
        }

        const card = await payments.card({ style: SQUARE_CARD_STYLE });
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

  if (!mounted) return null;

  const submitting = orderStatus === "submitting" || busy;
  const totalLabel = totalCents > 0 ? `$${(totalCents / 100).toFixed(2)}` : "";

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="pay-backdrop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close payment"
            className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            key="pay-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Complete payment"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="pointer-events-auto fixed left-1/2 top-1/2 z-[111] w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-sky-400/30 bg-navy p-6 shadow-2xl shadow-sky-950/50 ring-1 ring-sky-500/15 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-cream/60 hover:bg-sky-500/15 hover:text-cream"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-2xl text-cream">Complete payment</h2>
            <p className="mt-2 text-sm text-cream/70">
              {configured
                ? "Square securely tokenizes your card. We never store raw card data."
                : "Card fields are unavailable until Square keys are configured — you can still place an order without charging a card."}
            </p>

            <div className="mt-6">
              <div
                id="square-card-mount"
                ref={mountRef}
                className={cn(
                  "pointer-events-auto min-h-[72px] rounded-xl border border-sky-400/35 bg-[#0a1628] p-3",
                  !ready && "flex items-center justify-center text-sm text-cream/50",
                )}
              >
                {!ready && !message && "Loading card fields…"}
              </div>
              {!configured && (
                <p className="mt-3 text-xs text-cream/55">
                  Set{" "}
                  <code className="rounded bg-[#0a1628] px-1">NEXT_PUBLIC_SQUARE_APPLICATION_ID</code>{" "}
                  and <code className="rounded bg-[#0a1628] px-1">NEXT_PUBLIC_SQUARE_LOCATION_ID</code>{" "}
                  and reload to mount live Square fields.
                </p>
              )}
            </div>

            {message && (
              <p className="mt-4 rounded-xl border border-salsa/35 bg-salsa/10 px-4 py-2 text-sm text-salsa">
                {message}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={submitting || !canOpenPayment || !ready}
                onClick={() => void handlePay()}
                className="flex-1 rounded-full bg-sky-500 py-3 text-sm font-semibold uppercase tracking-editorial text-white shadow-lg shadow-sky-900/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Processing…" : `Pay ${totalLabel}`}
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-sky-400/35 px-5 py-3 text-sm text-cream/85 transition hover:bg-sky-500/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
