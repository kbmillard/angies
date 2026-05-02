import type { CloverConstructor, CloverInstance } from "./types";

const SDK_SRC = "https://checkout.clover.com/sdk.js";

let loadPromise: Promise<void> | null = null;

export function loadCloverSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.Clover) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Clover SDK failed")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Clover SDK"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function getCloverConfig() {
  const publicToken = process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX ?? "";
  const merchantId = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX ?? "";
  const env = (process.env.NEXT_PUBLIC_CLOVER_ENV ?? "sandbox").toLowerCase();
  return {
    publicToken,
    merchantId,
    environment: env === "production" ? "production" : "sandbox",
    configured: Boolean(publicToken && merchantId),
  } as const;
}

export function createCloverClient(): CloverInstance | null {
  const Ctor = window.Clover as CloverConstructor | undefined;
  const { publicToken, merchantId, environment } = getCloverConfig();
  if (!Ctor || !publicToken) return null;
  return new Ctor(publicToken, { merchantId, environment });
}
