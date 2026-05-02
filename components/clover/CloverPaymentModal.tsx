"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { createCloverClient, getCloverConfig, loadCloverSdk } from "@/lib/clover/loadClover";
import type { CloverCardElement } from "@/lib/clover/types";
import { useOrder } from "@/context/OrderContext";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CloverPaymentModal({ open, onOpenChange }: Props) {
  const mountId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<CloverCardElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { setCloverToken, submitOrder, canOpenPayment } = useOrder();
  const { configured } = getCloverConfig();

  const cleanupCard = useCallback(() => {
    const c = cardRef.current;
    if (c?.destroy) c.destroy();
    else if (c?.unmount) c.unmount();
    cardRef.current = null;
    if (hostRef.current) hostRef.current.innerHTML = "";
  }, []);

  useEffect(() => {
    if (!open) {
      cleanupCard();
      setMessage(null);
      setBusy(false);
    }
  }, [cleanupCard, open]);

  useEffect(() => {
    if (!open || !configured) return;
    let cancelled = false;
    (async () => {
      try {
        await loadCloverSdk();
        if (cancelled || !hostRef.current) return;
        const clover = createCloverClient();
        if (!clover) {
          setMessage("Clover is not configured — add sandbox keys to .env.local.");
          return;
        }
        const elements = clover.elements();
        const card = elements.create("CARD", {
          input: {
            fontSize: "16px",
            color: "#1a1a1a",
          },
        });
        card.mount(hostRef.current);
        cardRef.current = card;
      } catch {
        setMessage("Could not initialize Clover fields. Check your connection and keys.");
      }
    })();
    return () => {
      cancelled = true;
      cleanupCard();
    };
  }, [cleanupCard, configured, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange, open]);

  const handleTokenize = async () => {
    setBusy(true);
    setMessage(null);
    try {
      if (!configured) {
        const token = `tok_sandbox_${Date.now()}`;
        setCloverToken(token);
        await submitOrder(token);
        onOpenChange(false);
        return;
      }
      const card = cardRef.current as
        | { createToken?: () => Promise<{ token?: string }> }
        | null;
      if (!card?.createToken) {
        throw new Error("Clover card element is not ready yet.");
      }
      const res = await card.createToken();
      const token = res?.token;
      if (!token) throw new Error("No token returned from Clover.");
      setCloverToken(token);
      await submitOrder(token);
      onOpenChange(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${mountId}-title`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close payment"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[81] w-full max-w-lg rounded-t-2xl border border-white/10 bg-charcoal p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p
              id={`${mountId}-title`}
              className="font-display text-2xl text-cream"
            >
              Card checkout
            </p>
            <p className="mt-1 text-sm text-cream/70">
              {configured
                ? "Clover securely tokenizes your card. We never store raw card data."
                : "Card fields are unavailable until Clover sandbox keys are configured — you can still place an order without charging a card."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 p-2 text-cream hover:bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {configured ? (
          <div
            ref={hostRef}
            id="clover-card-mount"
            className="min-h-[200px] rounded-xl border border-white/10 bg-cream p-4 text-charcoal"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-cream/80">
            Set{" "}
            <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX</code>{" "}
            and{" "}
            <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX</code>{" "}
            in <code className="rounded bg-black/40 px-1">.env.local</code>, then
            reload to mount live Clover fields.
          </div>
        )}

        {message ? (
          <p className="mt-3 text-sm text-salsa" role="status">
            {message}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-full border border-white/15 px-5 py-3 text-sm uppercase tracking-editorial text-cream hover:bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !canOpenPayment}
            className="rounded-full bg-salsa px-6 py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-lg transition hover:bg-salsa/90 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleTokenize}
          >
            {configured ? (busy ? "Processing…" : "Pay & place order") : "Place order without card"}
          </button>
        </div>
      </div>
    </div>
  );
}
