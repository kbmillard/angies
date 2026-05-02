import type { LocationsResponse } from "./schema";
import { FOOTER_VISIT_FALLBACK } from "./footer-visit-fallbacks";
import type { LocationItem } from "./schema";

function cityStateZipLine(loc: LocationItem): string {
  const city = loc.city?.trim();
  const state = loc.state?.trim();
  const zip = loc.zip?.trim();
  if (city && state && zip) return `${city}, ${state} ${zip}`;
  if (city && state) return `${city}, ${state}`;
  return [city, state, zip].filter(Boolean).join(" ");
}

export type FooterRestaurantVisit = {
  address: string;
  cityLine: string;
};

export type FooterTruckVisit = {
  address: string;
  detail: string;
  cityLine: string;
};

export function footerRestaurantVisit(
  data: LocationsResponse | null,
): FooterRestaurantVisit {
  const loc = data?.restaurantLocations?.[0];
  if (loc?.address?.trim()) {
    return {
      address: loc.address.trim(),
      cityLine: cityStateZipLine(loc) || FOOTER_VISIT_FALLBACK.restaurant.cityLine,
    };
  }
  return { ...FOOTER_VISIT_FALLBACK.restaurant };
}

export function footerTruckVisit(data: LocationsResponse | null): FooterTruckVisit {
  const loc = data?.foodTruckLocations?.[0];
  if (loc?.address?.trim()) {
    return {
      address: loc.address.trim(),
      detail: loc.statusNote?.trim() ?? "",
      cityLine: cityStateZipLine(loc) || FOOTER_VISIT_FALLBACK.truck.cityLine,
    };
  }
  return {
    address: FOOTER_VISIT_FALLBACK.truck.address,
    detail: FOOTER_VISIT_FALLBACK.truck.detail,
    cityLine: FOOTER_VISIT_FALLBACK.truck.cityLine,
  };
}

export function footerHoursLines(
  data: LocationsResponse | null,
  instagramLine: string | undefined,
): string[] {
  if (data?.locations?.length) {
    const primary = data.locations
      .map((loc) => {
        const h = loc.hours?.trim();
        return h ? `${loc.name?.trim() || "Location"} — ${h}` : null;
      })
      .filter(Boolean) as string[];
    if (primary.length) {
      const lines = instagramLine ? [...primary, instagramLine] : [...primary];
      return lines;
    }
  }
  return instagramLine
    ? [FOOTER_VISIT_FALLBACK.hoursPrimary, instagramLine]
    : [FOOTER_VISIT_FALLBACK.hoursPrimary];
}
