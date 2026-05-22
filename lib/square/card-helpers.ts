import type { SquareCard, SquareCardInputEvent } from "./types";
import type { SquareEnv } from "./types";

const CARD_INPUT_EVENTS = [
  "cardBrandChanged",
  "focusClassAdded",
  "focusClassRemoved",
  "errorClassAdded",
  "errorClassRemoved",
  "postalCodeChanged",
] as const;

/** Poll until Square injects an iframe with plausible card-field dimensions. */
export async function waitForSquareMountVisible(
  container: HTMLElement,
  timeoutMs = 3000,
  intervalMs = 100,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const iframe = container.querySelector("iframe");
    if (iframe) {
      const rect = iframe.getBoundingClientRect();
      if (rect.height >= 48 && rect.width >= 100) return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

/**
 * After attach, wait for iframe shell plus a Square input event (proves fields rendered).
 * Empty iframes from sandbox font/CSP bugs fail here instead of showing a dead mount.
 */
export async function waitForSquareCardReady(
  card: SquareCard,
  container: HTMLElement,
  timeoutMs = 5000,
): Promise<boolean> {
  const visible = await waitForSquareMountVisible(
    container,
    Math.min(timeoutMs, 3000),
  );
  if (!visible) return false;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    const onSignal = () => finish(true);
    card.addEventListener("focusClassAdded", onSignal);
    card.addEventListener("cardBrandChanged", onSignal);

    window.setTimeout(() => finish(false), timeoutMs);
  });
}

export function squareMountFailureMessage(environment: SquareEnv): string {
  const base =
    "Payment fields didn't load. Tap Cancel, then Checkout with Square again.";
  if (environment === "sandbox") {
    return `${base} Square sandbox sometimes fails to show card fields in the browser; production checkout may work, or try a private window.`;
  }
  return base;
}

export function bindSquareCardListeners(
  card: SquareCard,
  onPayableChange: (payable: boolean) => void,
): void {
  const handleEvent = (event: SquareCardInputEvent) => {
    onPayableChange(event.detail?.currentState?.isCompletelyValid === true);
  };

  for (const eventType of CARD_INPUT_EVENTS) {
    card.addEventListener(eventType, handleEvent);
  }
}

export function formatSquareTokenizeMessage(
  raw: string | undefined,
  cardPayable: boolean,
): string {
  if (!cardPayable) {
    return "Payment fields didn't load. Tap Cancel, then Checkout with Square again.";
  }

  const lower = (raw ?? "").toLowerCase();
  if (
    lower.includes("not valid") ||
    lower.includes("invalid") ||
    lower.includes("empty") ||
    lower.includes("required") ||
    lower.includes("incomplete")
  ) {
    return "Enter your card number, expiry, CVV, and ZIP, then try again.";
  }

  return raw ?? "Card tokenization failed. Check your card details and try again.";
}
