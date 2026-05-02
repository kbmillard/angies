import type { LocationItem } from "./schema";
import { DEFAULT_MAP_CENTER_COMMA } from "@/lib/maps/default-map-pin";

/**
 * Text search when the truck row has no address yet (Apple / Google Maps links).
 * Anchored to KC so Google does not pick an unrelated business (e.g. in Kentucky).
 */
export const MAPS_FALLBACK_SEARCH_QUERY =
  "Angie's food truck 400 E Linwood Blvd Kansas City Missouri" as const;

function publicMapsEmbedKey(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || undefined;
}

/** Maps Embed API v1 /place when a browser-safe key is available. */
function mapsEmbedV1Place(loc: LocationItem, key: string): string | null {
  const pub = key.trim();
  if (!pub) return null;
  const pid = loc.placeId?.trim();
  if (pid) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(pub)}&q=place_id:${encodeURIComponent(pid)}`;
  }
  if (
    loc.lat != null &&
    loc.lng != null &&
    Number.isFinite(loc.lat) &&
    Number.isFinite(loc.lng)
  ) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(pub)}&q=${encodeURIComponent(`${loc.lat},${loc.lng}`)}`;
  }
  const line = formatAddressLine(loc);
  if (line.trim()) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(pub)}&q=${encodeURIComponent(line)}`;
  }
  return `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(pub)}&center=${encodeURIComponent(DEFAULT_MAP_CENTER_COMMA)}&zoom=10`;
}

/**
 * Server-side: optional precomputed Embed API URL for JSON (uses the browser/public key only).
 * Returns undefined when owner `embedUrl` is set (client uses that) or no key.
 */
export function buildMapEmbedSrcForResponse(
  loc: LocationItem,
  publicKey?: string | null,
): string | undefined {
  if (loc.embedUrl?.trim()) return undefined;
  const k = publicKey?.trim() || publicMapsEmbedKey();
  if (!k) return undefined;
  return mapsEmbedV1Place(loc, k) ?? undefined;
}

/** Single-line postal address for display and map search fallback. */
export function formatAddressLine(loc: LocationItem): string {
  const cityLine = [loc.city, loc.state, loc.zip].filter(Boolean).join(" ").trim();
  return [loc.address, cityLine].filter(Boolean).join(", ");
}

/** Google Maps “search” URL when `mapsUrl` is blank. */
export function defaultMapsSearchUrl(loc: LocationItem): string {
  const q = formatAddressLine(loc).trim();
  const query = q || MAPS_FALLBACK_SEARCH_QUERY;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function resolvedMapsUrl(loc: LocationItem): string {
  const u = loc.mapsUrl?.trim();
  return u || defaultMapsSearchUrl(loc);
}

export function resolvedAppleMapsUrl(loc: LocationItem): string {
  const q = formatAddressLine(loc).trim();
  const query = q || MAPS_FALLBACK_SEARCH_QUERY;
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

/** Classic embed (no API key) — KC metro view only when there is no address or place id. */
export function brandFallbackMapsClassicEmbedUrl(): string {
  return `https://www.google.com/maps?ll=${DEFAULT_MAP_CENTER_COMMA}&z=10&output=embed`;
}

/** Classic Google Maps embed (no API key) when only an address is available. */
export function addressOnlyMapsEmbedIframeUrl(loc: LocationItem): string | null {
  const line = formatAddressLine(loc);
  if (!line.trim()) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(line)}&output=embed`;
}

/** Classic Google Maps embed (no API key) when only a Place ID is available. */
export function placeIdOnlyMapsEmbedIframeUrl(placeId: string): string | null {
  const p = placeId.trim();
  if (!p) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(`place_id:${p}`)}&output=embed`;
}

/**
 * Iframe src: explicit embedUrl, then server-built mapEmbedSrc, then Embed v1 with
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, then legacy `maps?q=lat,lng&output=embed`.
 */
export function resolvedEmbedSrc(loc: LocationItem): string | null {
  const e = loc.embedUrl?.trim();
  if (e) return e;
  const pre = loc.mapEmbedSrc?.trim();
  if (pre) return pre;
  const pub = publicMapsEmbedKey();
  if (pub) {
    const v1 = mapsEmbedV1Place(loc, pub);
    if (v1) return v1;
  }
  if (loc.lat != null && loc.lng != null && !Number.isNaN(loc.lat) && !Number.isNaN(loc.lng)) {
    return `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=16&output=embed`;
  }
  return addressOnlyMapsEmbedIframeUrl(loc) ?? brandFallbackMapsClassicEmbedUrl();
}

export function telHrefFromDisplay(phoneDisplay: string, fallbackTel: string): string {
  const d = phoneDisplay.replace(/\D/g, "");
  if (d.length === 10) return `tel:+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `tel:+${d}`;
  if (d.length >= 10) return `tel:+${d}`;
  return `tel:${fallbackTel}`;
}
