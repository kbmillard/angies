"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  bindSquareCardListeners,
  formatSquareTokenizeMessage,
  squareMountFailureMessage,
  waitForSquareMountVisible,
} from "@/lib/square/card-helpers";
import { createSquarePayments, getSquareConfig, loadSquareSdk } from "@/lib/square/loadSquare";
import type { SquareCard } from "@/lib/square/types";
import { SwipeToConfirm } from "@/components/order/SwipeToConfirm";
import { cn } from "@/lib/utils/cn";

/** Card field styling (dark charcoal theme) */
const SQUARE_CARD_STYLE = {
  ".input-container": {
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
  },
  ".input-container.is-focus": {
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  ".input-container.is-error": {
    borderColor: "#f87171",
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#f5f0e8",
    fontSize: "16px",
  },
  "input::placeholder": {
    color: "rgba(245, 240, 232, 0.40)",
  },
  ".message-text": {
    color: "#f87171",
  },
  ".message-icon": {
    color: "#f87171",
  },
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type SquareCardFieldsProps = {
  totalCents: number;
  onToken: (token: string) => Promise<void>;
  onCancel: () => void;
  externalBusy?: boolean;
};

/**
 * Square Web Payments card form — mount container must stay free of React children
 * so reconciliation does not remove Square's injected iframe after attach.
 */
export function SquareCardFields({
  totalCents,
  onToken,
  onCancel,
  externalBusy = false,
}: SquareCardFieldsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const mountIdRef = useRef(
    `square-card-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
  );

  const [cardMounted, setCardMounted] = useState(false);
  const [cardPayable, setCardPayable] = useState(false);
  const [cardMessage, setCardMessage] = useState<string | null>(null);
  const [cardBusy, setCardBusy] = useState(false);
  const { configured, environment: squareEnvironment } = getSquareConfig();

  useLayoutEffect(() => {
    const mountElement = mountRef.current;
    if (!mountElement) return;

    mountElement.id = mountIdRef.current;
    let cancelled = false;

    const mountCard = async () => {
      try {
        await loadSquareSdk();
        if (cancelled) return;

        const payments = await createSquarePayments();
        if (!payments || cancelled) {
          setCardMessage(
            "Square is not configured — add application ID and location ID to environment variables.",
          );
          return;
        }

        const card = await payments.card({ style: SQUARE_CARD_STYLE });
        if (cancelled) {
          card.destroy();
          return;
        }

        await card.attach(`#${mountIdRef.current}`);
        if (cancelled) {
          card.destroy();
          return;
        }

        const ready = await waitForSquareMountVisible(mountElement, 10_000);
        if (cancelled) {
          card.destroy();
          return;
        }

        if (!ready) {
          card.destroy();
          setCardMessage(squareMountFailureMessage(squareEnvironment));
          return;
        }

        bindSquareCardListeners(card, (payable) => {
          if (!cancelled) setCardPayable(payable);
        });

        cardRef.current = card;
        setCardMounted(true);
        setCardPayable(false);
        setCardMessage(null);
      } catch (err) {
        if (!cancelled) {
          console.error("Square card mount failed:", err);
          setCardMessage(
            err instanceof Error
              ? err.message
              : "Could not initialize Square card fields. Try refreshing the page.",
          );
        }
      }
    };

    // Two frames so the drawer animation finishes before attach (Safari/mobile).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) void mountCard();
      });
    });

    return () => {
      cancelled = true;
      if (cardRef.current) {
        try {
          cardRef.current.destroy();
        } catch {
          // ignore
        }
        cardRef.current = null;
      }
    };
  }, [squareEnvironment]);

  const handlePay = useCallback(async () => {
    if (!cardRef.current || cardBusy || externalBusy || !cardPayable) return;
    setCardBusy(true);
    setCardMessage(null);

    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        const raw = result.errors?.[0]?.message;
        setCardMessage(formatSquareTokenizeMessage(raw, cardPayable));
        return;
      }
      await onToken(result.token);
    } catch (err) {
      setCardMessage(
        err instanceof Error
          ? formatSquareTokenizeMessage(err.message, cardPayable)
          : "Payment error",
      );
    } finally {
      setCardBusy(false);
    }
  }, [cardBusy, cardPayable, externalBusy, onToken]);

  const payDisabled = cardBusy || externalBusy;

  return (
    <>
      <div className="flex items-center justify-center gap-2 text-xs text-cream/60">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4.01 8.54C4.01 6.19 5.9 4.3 8.26 4.3c1.06 0 2.04.38 2.79 1.05l.76.69.76-.69C13.32 4.68 14.3 4.3 15.36 4.3c2.36 0 4.25 1.89 4.25 4.24 0 4.59-4.87 8.02-7.87 9.84-3-1.82-7.73-5.25-7.73-9.84z" />
        </svg>
        <span>Secure checkout with Square</span>
      </div>

      {/* Wrapper holds loading overlay; mount div stays empty for Square iframe */}
      <div className="relative min-h-[80px] rounded-xl border border-white/15 bg-black/40 p-3">
        <div ref={mountRef} className="min-h-[56px] w-full" aria-label="Card payment fields" />
        {!cardMounted && !cardMessage ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-cream/50"
            aria-live="polite"
          >
            Loading card fields…
          </div>
        ) : null}
      </div>

      {!configured ? (
        <p className="text-xs text-cream/55">
          Set{" "}
          <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_SQUARE_APPLICATION_ID</code> and{" "}
          <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_SQUARE_LOCATION_ID</code> and reload.
        </p>
      ) : null}

      {cardMessage ? (
        <p className="rounded-xl border border-salsa/35 bg-salsa/10 px-4 py-2 text-sm text-salsa">
          {cardMessage}
        </p>
      ) : null}

      {cardPayable && !payDisabled ? (
        <>
          <div className="sm:hidden">
            <SwipeToConfirm
              onConfirm={() => void handlePay()}
              disabled={payDisabled}
              label={`Swipe to pay ${formatMoney(totalCents)}`}
            />
          </div>
          <button
            type="button"
            onClick={() => void handlePay()}
            className="hidden w-full items-center justify-center gap-2 rounded-full bg-angie-orange py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-lg transition hover:bg-angie-orange/90 sm:flex"
          >
            Pay {formatMoney(totalCents)}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled
          className={cn(
            "w-full rounded-full py-3 text-sm font-semibold uppercase tracking-editorial",
            payDisabled ? "bg-angie-orange/60 text-cream/80" : "bg-angie-orange/40 text-cream/50",
          )}
        >
          {payDisabled
            ? "Processing…"
            : cardMounted
              ? "Enter card details"
              : "Loading card fields…"}
        </button>
      )}

      <button
        type="button"
        onClick={onCancel}
        disabled={payDisabled}
        className="w-full rounded-full border border-white/15 py-2.5 text-sm text-cream/85 transition hover:bg-white/5 disabled:opacity-50"
      >
        Cancel
      </button>
    </>
  );
}
