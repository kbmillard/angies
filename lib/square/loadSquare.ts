import type { SquareEnv, SquarePayments } from "./types";

const SANDBOX_SDK = "https://sandbox.web.squarecdn.com/v1/square.js";
const PRODUCTION_SDK = "https://web.squarecdn.com/v1/square.js";

let loadPromise: Promise<void> | null = null;

export function getSquareConfig() {
  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
  const env = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase() as SquareEnv;
  const configured = Boolean(applicationId.trim() && locationId.trim());
  return { applicationId, locationId, environment: env, configured };
}

export function loadSquareSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Square) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const { environment } = getSquareConfig();
  const src = environment === "production" ? PRODUCTION_SDK : SANDBOX_SDK;

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    loadPromise = new Promise<void>((resolve, reject) => {
      if (window.Square) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Square SDK failed")), {
        once: true,
      });
    });
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Square SDK"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function createSquarePayments(): Promise<SquarePayments | null> {
  if (typeof window === "undefined" || !window.Square) return null;
  const { applicationId, locationId, configured } = getSquareConfig();
  if (!configured) return null;

  try {
    return await window.Square.payments(applicationId, locationId);
  } catch {
    return null;
  }
}
