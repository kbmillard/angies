"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LocationsResponse } from "@/lib/locations/schema";

type LocationsCatalogContextValue = {
  loading: boolean;
  error: string | null;
  data: LocationsResponse | null;
};

const LocationsCatalogContext = createContext<LocationsCatalogContextValue | null>(null);

export function LocationsCatalogProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LocationsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/locations")
      .then((r) => {
        if (!r.ok) throw new Error(`Locations API ${r.status}`);
        return r.json() as Promise<LocationsResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        if (process.env.NODE_ENV === "development" && json.source === "local-fallback") {
          console.warn(
            "Location source: local fallback. Set LOCATIONS_CSV_URL or NEXT_PUBLIC_LOCATIONS_CSV_URL to enable Google Sheets location updates.",
          );
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Locations failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ loading, error, data }),
    [data, error, loading],
  );

  return (
    <LocationsCatalogContext.Provider value={value}>
      {children}
    </LocationsCatalogContext.Provider>
  );
}

export function useLocationsCatalog() {
  const ctx = useContext(LocationsCatalogContext);
  if (!ctx) {
    throw new Error("useLocationsCatalog must be used within LocationsCatalogProvider");
  }
  return ctx;
}
