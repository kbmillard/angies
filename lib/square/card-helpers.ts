import type { SquareCard, SquareCardEventType, SquareCardInputEvent } from "./types";

const CARD_INPUT_EVENTS: SquareCardEventType[] = [
  "cardBrandChanged",
  "focusClassAdded",
  "focusClassRemoved",
  "errorClassAdded",
  "errorClassRemoved",
  "postalCodeChanged",
];

/** Poll until Square injects a visible iframe or content into the mount node. */
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
      if (rect.height > 10 && rect.width > 10) return true;
    }
    if (container.children.length > 0 && container.offsetHeight > 40) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
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
