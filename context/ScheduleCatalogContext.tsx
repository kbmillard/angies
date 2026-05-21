"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ScheduleResponse } from "@/lib/schedule/schema";

type ScheduleCatalogContextValue = {
  loading: boolean;
  error: string | null;
  data: ScheduleResponse | null;
};

const ScheduleCatalogContext = createContext<ScheduleCatalogContextValue | null>(null);

export function ScheduleCatalogProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScheduleResponse | null>(null);

  // Fetch schedule data
  const fetchSchedule = React.useCallback(() => {
    fetch("/api/schedule")
      .then((r) => {
        if (!r.ok) throw new Error(`Schedule API ${r.status}`);
        return r.json() as Promise<ScheduleResponse>;
      })
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Schedule failed to load");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchSchedule();

    // Poll every 30 seconds
    const intervalId = setInterval(fetchSchedule, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchSchedule]);

  // Refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSchedule();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchSchedule]);

  const value = useMemo(
    () => ({ loading, error, data }),
    [data, error, loading],
  );

  return (
    <ScheduleCatalogContext.Provider value={value}>
      {children}
    </ScheduleCatalogContext.Provider>
  );
}

export function useScheduleCatalog() {
  const ctx = useContext(ScheduleCatalogContext);
  if (!ctx) {
    throw new Error("useScheduleCatalog must be used within ScheduleCatalogProvider");
  }
  return ctx;
}
