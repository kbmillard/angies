"use client";

import { useEffect, useState } from "react";
import type { LocationItem } from "@/lib/locations/schema";
import {
  addressOnlyMapsEmbedIframeUrl,
  brandFallbackMapsClassicEmbedUrl,
  formatAddressLine,
  placeIdOnlyMapsEmbedIframeUrl,
} from "@/lib/locations/helpers";
import { DEFAULT_MAP_PIN_LAT, DEFAULT_MAP_PIN_LNG } from "@/lib/maps/default-map-pin";
import { loadGoogleMapsScript } from "@/lib/maps/load-google-maps-script";
import { GoogleMapGreedy } from "@/components/locations/GoogleMapGreedy";

type Props = {
  loc: LocationItem;
  title?: string;
  className?: string;
};

/**
 * When the API has no lat/lng yet, resolve placeId or address in the browser with the
 * Maps JavaScript Geocoder (HTTP-referrer key). On failure, falls back to a classic
 * address-only Google Maps iframe (no API key).
 */
function classicMapsEmbedFallback(loc: LocationItem, placeId: string | undefined): string {
  return (
    addressOnlyMapsEmbedIframeUrl(loc) ??
    (placeId ? placeIdOnlyMapsEmbedIframeUrl(placeId) : null) ??
    brandFallbackMapsClassicEmbedUrl()
  );
}

export function GoogleMapClientResolved({ loc, title, className }: Props) {
  const line = formatAddressLine(loc);
  const placeId = loc.placeId?.trim();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [iframeFallback, setIframeFallback] = useState<string | null>(null);

  useEffect(() => {
    setCoords(null);
    setIframeFallback(null);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (!apiKey) {
      setIframeFallback(classicMapsEmbedFallback(loc, placeId));
      return;
    }
    if (!placeId && !line.trim()) {
      setIframeFallback(brandFallbackMapsClassicEmbedUrl());
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await loadGoogleMapsScript(apiKey);
      } catch {
        if (!cancelled) setIframeFallback(classicMapsEmbedFallback(loc, placeId));
        return;
      }
      if (cancelled) return;

      const geocoder = new google.maps.Geocoder();
      const request: google.maps.GeocoderRequest = placeId
        ? { placeId }
        : { address: line.trim() };

      geocoder.geocode(request, (results, status) => {
        if (cancelled) return;
        const first = results?.[0];
        const point = first?.geometry?.location;
        if (status !== "OK" || !point) {
          setIframeFallback(classicMapsEmbedFallback(loc, placeId));
          return;
        }
        setCoords({ lat: point.lat(), lng: point.lng() });
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [line, placeId, loc.id]); // eslint-disable-line react-hooks/exhaustive-deps -- loc fields reflected in line/placeId/id

  if (coords) {
    return (
      <GoogleMapGreedy
        lat={coords.lat}
        lng={coords.lng}
        title={title ?? loc.name}
        className={className}
      />
    );
  }

  if (iframeFallback) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (apiKey) {
      return (
        <GoogleMapGreedy
          lat={DEFAULT_MAP_PIN_LAT}
          lng={DEFAULT_MAP_PIN_LNG}
          title={title ?? loc.name}
          className={className}
        />
      );
    }
    return (
      <iframe
        title={`Map — ${loc.name}`}
        className={className ?? "h-[220px] w-full bg-charcoal"}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={iframeFallback}
      />
    );
  }

  return <div className={className ?? "h-[220px] w-full min-h-[220px] animate-pulse bg-charcoal/60"} />;
}
