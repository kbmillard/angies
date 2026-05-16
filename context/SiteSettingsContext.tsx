"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";

const SiteSettingsContext = createContext<SiteSettingsResolved | null>(null);

type Props = {
  value: SiteSettingsResolved;
  children: ReactNode;
};

export function SiteSettingsProvider({ value, children }: Props) {
  const memo = useMemo(() => value, [value]);
  return <SiteSettingsContext.Provider value={memo}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsResolved {
  const v = useContext(SiteSettingsContext);
  if (!v) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return v;
}
