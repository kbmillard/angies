import { geocodeLocationAddress, getGeocodeApiKey } from "./google-geocode";
import { parseLocationsFromCsvText } from "./google-sheet-locations";
import { buildMapEmbedSrcForResponse, formatAddressLine } from "./helpers";
import { localLocationItems } from "./local-locations";
import type { LocationItem, LocationsResponse, LocationsSource } from "./schema";

function sortLocations(items: LocationItem[]): LocationItem[] {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });
}

function hasResolvedCoords(loc: LocationItem): boolean {
  return (
    loc.lat != null &&
    loc.lng != null &&
    Number.isFinite(loc.lat) &&
    Number.isFinite(loc.lng)
  );
}

async function enrichLocationItem(loc: LocationItem): Promise<LocationItem> {
  const publicKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const hadCoords = hasResolvedCoords(loc);
  const g = await geocodeLocationAddress(loc);

  let next: LocationItem = { ...loc };

  if (g?.source === "sheet") {
    next.geocodeSource = "sheet";
  } else if (g?.source === "google-geocode") {
    next = {
      ...next,
      lat: g.lat,
      lng: g.lng,
      placeId: g.placeId ?? next.placeId,
      formattedAddress: g.formattedAddress ?? next.formattedAddress,
      geocodeSource: "google-geocode",
      geocodedAt: new Date().toISOString(),
    };
  } else {
    if (
      !hadCoords &&
      formatAddressLine(next).trim() &&
      process.env.NODE_ENV === "development" &&
      getGeocodeApiKey()
    ) {
      console.warn(
        `Location geocode unavailable for ${next.name}. Check address or server Geocoding API key.`,
      );
    }
    if (!next.geocodeSource) {
      next.geocodeSource = "fallback";
    }
  }

  const embedSrc = buildMapEmbedSrcForResponse(next, publicKey);
  return embedSrc ? { ...next, mapEmbedSrc: embedSrc } : next;
}

let mapsKeyDevNoteShown = false;

function warnMapsKeyDevNote(): void {
  if (process.env.NODE_ENV !== "development") return;
  const pub = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const server =
    process.env.GOOGLE_MAPS_SERVER_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!pub || server) return;
  if (mapsKeyDevNoteShown) return;
  mapsKeyDevNoteShown = true;
  console.warn(
    "Maps: using NEXT_PUBLIC_GOOGLE_MAPS_API_KEY with HTTP referrer restrictions for client-side maps and geocoding. Google Cloud no longer requires a separate key at creation when website restrictions are set. GOOGLE_MAPS_SERVER_KEY is optional—only add it if you want server-side Geocoding API; restrict that key by IP and do not use the referrer-restricted key on the server.",
  );
}

async function enrichLocationItems(items: LocationItem[]): Promise<LocationItem[]> {
  warnMapsKeyDevNote();
  return Promise.all(items.map((item) => enrichLocationItem(item)));
}

function buildResponse(
  items: LocationItem[],
  source: LocationsSource,
  updatedAt: string,
): LocationsResponse {
  const sorted = sortLocations(items.filter((i) => i.active));
  const restaurantLocations = sorted.filter((i) => i.type === "restaurant");
  const foodTruckLocations = sorted.filter((i) => i.type === "food_truck");
  return {
    locations: sorted,
    restaurantLocations,
    foodTruckLocations,
    source,
    updatedAt,
  };
}

/**
 * Locations CSV is cached ~5 minutes via fetch `revalidate: 300`.
 */
export async function getLocationsCatalog(): Promise<LocationsResponse> {
  const updatedAt = new Date().toISOString();
  const url = process.env.LOCATIONS_CSV_URL ?? process.env.NEXT_PUBLIC_LOCATIONS_CSV_URL;

  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`Locations CSV fetch ${res.status}`);
      const text = await res.text();
      const parsed = parseLocationsFromCsvText(text);
      if (parsed.length === 0) throw new Error("Parsed zero location rows");
      const enriched = await enrichLocationItems(parsed);
      return buildResponse(enriched, "google-sheet", updatedAt);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[locations] Google Sheet / CSV failed, using local fallback:", e);
      }
    }
  }

  const enrichedLocal = await enrichLocationItems(localLocationItems);
  return buildResponse(enrichedLocal, "local-fallback", updatedAt);
}
