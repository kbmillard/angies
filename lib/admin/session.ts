import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_PHOTOS_COOKIE = "angies_admin_photos";

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PHOTOS_PASSWORD?.trim());
}

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PHOTOS_PASSWORD?.trim() ||
    ""
  );
}

/** Signed token: `${expiresAtMs}.${hexSignature}` */
export function signAdminSession(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PHOTOS_PASSWORD is not set");
  const ttlMs = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = Date.now() + ttlMs;
  const sig = createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
  return `${expiresAt}.${sig}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const secret = sessionSecret();
  if (!secret) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  if (!/^[0-9a-f]+$/i.test(sig) || sig.length < 32) return false;
  const expected = createHmac("sha256", secret).update(expStr).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
