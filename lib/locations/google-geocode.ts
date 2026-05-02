import type { LocationItem } from "./schema";
import { formatAddressLine } from "./helpers";

export type GeocodeResult = {
  lat: number;
  lng: number;
  placeId?: string;
  formattedAddress?: string;
  /** `sheet` = coordinates already on the row (no API call). `google-geocode` = from Geocoding API. */
  source: "google-geocode" | "sheet";
};

/**
 * Key for **Google Geocoding API (web service)** on the server only, when you opt in
 * to server-side geocoding. Restrict this key by **IP** (or another server-appropriate
 * restriction)—do not use an HTTP-referrer–restricted (browser) key for these requests.
 *
 * A second key is **not** required by Google Cloud when your public key already uses
 * website restrictions; it is only needed if you call the Geocoding web service from
 * your backend. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is intentionally **not** used here;
 * the browser resolves addresses with the Maps JavaScript Geocoder when no server key exists.
 */
export function getGeocodeApiKey(): string | undefined {
  const k =
    process.env.GOOGLE_MAPS_SERVER_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim();
  return k || undefined;
}

function hasStoredCoords(loc: LocationItem): boolean {
  return (
    loc.lat != null &&
    loc.lng != null &&
    Number.isFinite(loc.lat) &&
    Number.isFinite(loc.lng)
  );
}

/**
 * Geocode a location address via Google Geocoding API (server-only).
 * If the row already has lat/lng, returns those with `source: "sheet"` (no API call).
 * Returns null if no **server** geocoding key, empty address, or API error / zero results.
 */
export async function geocodeLocationAddress(
  location: LocationItem,
): Promise<GeocodeResult | null> {
  if (hasStoredCoords(location)) {
    return {
      lat: location.lat!,
      lng: location.lng!,
      placeId: location.placeId,
      formattedAddress: location.formattedAddress,
      source: "sheet",
    };
  }

  const key = getGeocodeApiKey();
  if (!key) {
    return null;
  }

  const address = formatAddressLine(location);
  if (!address.trim()) {
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[geocode] HTTP error for location:", location.name, res.status);
      }
      return null;
    }
    const data = (await res.json()) as {
      status?: string;
      error_message?: string;
      results?: Array<{
        formatted_address?: string;
        place_id?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
      }>;
    };

    if (data.status !== "OK" || !data.results?.length) {
      if (process.env.NODE_ENV === "development" && data.status && data.status !== "ZERO_RESULTS") {
        console.warn("[geocode] status for", location.name, ":", data.status);
      }
      return null;
    }

    const first = data.results[0]!;
    const lat = first.geometry?.location?.lat;
    const lng = first.geometry?.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return {
      lat,
      lng,
      placeId: typeof first.place_id === "string" ? first.place_id : undefined,
      formattedAddress:
        typeof first.formatted_address === "string" ? first.formatted_address : undefined,
      source: "google-geocode",
    };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[geocode] fetch failed for", location.name, e);
    }
    return null;
  }
}
