"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MenuCatalogResponse, MenuItem } from "@/lib/menu/schema";

type MenuCatalogContextValue = {
  loading: boolean;
  error: string | null;
  data: MenuCatalogResponse | null;
  itemsById: Map<string, MenuItem>;
};

const MenuCatalogContext = createContext<MenuCatalogContextValue | null>(null);

export function MenuCatalogProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MenuCatalogResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/menu")
      .then((r) => {
        if (!r.ok) throw new Error(`Menu API ${r.status}`);
        return r.json() as Promise<MenuCatalogResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        if (process.env.NODE_ENV === "development" && json.source === "local-fallback") {
          console.warn(
            "Menu source: local fallback. Set NEXT_PUBLIC_MENU_CSV_URL or MENU_CSV_URL to enable Google Sheets menu updates.",
          );
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Menu failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const itemsById = useMemo(() => {
    const m = new Map<string, MenuItem>();
    for (const it of data?.items ?? []) {
      m.set(it.id, it);
    }
    return m;
  }, [data]);

  const value = useMemo(
    () => ({ loading, error, data, itemsById }),
    [data, error, itemsById, loading],
  );

  return (
    <MenuCatalogContext.Provider value={value}>{children}</MenuCatalogContext.Provider>
  );
}

export function useMenuCatalog() {
  const ctx = useContext(MenuCatalogContext);
  if (!ctx) {
    throw new Error("useMenuCatalog must be used within MenuCatalogProvider");
  }
  return ctx;
}
