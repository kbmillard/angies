/**
 * Shared next/image allowlist + URL normalization for menu/admin photos.
 */

export const NEXT_IMAGE_HOSTS = [
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
  "storage.googleapis.com",
  /** Vercel Blob — menu/admin uploaded images */
  "*.public.blob.vercel-storage.com",
  "*.blob.vercel-storage.com",
] as const;

/** Next.js `hostname` wildcards match a single DNS label. */
export function isAllowedNextImageHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  return NEXT_IMAGE_HOSTS.some((pattern) => {
    if (!pattern.startsWith("*.")) {
      return host === pattern;
    }
    const suffix = pattern.slice(1);
    if (!host.endsWith(suffix)) return false;
    const label = host.slice(0, -suffix.length);
    return label.length > 0 && !label.includes(".");
  });
}

/**
 * Decode percent-encoded local paths (DB rows store `%20`) and keep Blob URLs
 * absolute so `next/image` can proxy them same-origin on mobile Safari.
 */
export function normalizePublicImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  try {
    return decodeURI(withSlash);
  } catch {
    return withSlash;
  }
}
