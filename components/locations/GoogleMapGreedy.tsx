"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMapsScript } from "@/lib/maps/load-google-maps-script";

type Props = {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
};

/**
 * Inline map — greedy gestures so drag/scroll/zoom work on the map without the cooperative
 * “⌘ + scroll to zoom” overlay. Maps JavaScript API key required.
 */
export function GoogleMapGreedy({ lat, lng, title, className }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const el = elRef.current;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (!el || !apiKey) return undefined;

    let cancelled = false;

    void (async () => {
      try {
        await loadGoogleMapsScript(apiKey);
      } catch {
        return;
      }
      if (cancelled || !elRef.current) return;

      const map = new google.maps.Map(elRef.current, {
        center: { lat, lng },
        zoom: 16,
        gestureHandling: "greedy",
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      mapRef.current = map;

      new google.maps.Marker({
        map,
        position: { lat, lng },
        title: title?.trim() || undefined,
      });

      map.setOptions({ gestureHandling: "greedy" });

      requestAnimationFrame(() => {
        if (!cancelled && mapRef.current && window.google?.maps?.event) {
          window.google.maps.event.trigger(mapRef.current, "resize");
        }
      });
    })();

    return () => {
      cancelled = true;
      const m = mapRef.current;
      mapRef.current = null;
      if (m && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(m);
      }
    };
  }, [lat, lng, title]);

  return <div ref={elRef} className={className} role="presentation" />;
}
