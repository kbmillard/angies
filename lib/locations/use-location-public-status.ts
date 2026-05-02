"use client";

import { useLayoutEffect, useState } from "react";
import type { LocationItem } from "./schema";
import { getLocationPublicStatus, type PublicHoursStatus } from "./hours";

/**
 * Client-only live status: first render is `null` (show “Checking hours…”) so we never
 * flash raw Sheet `Open`. `useLayoutEffect` runs before paint so the correct computed
 * status appears on the first painted frame after hydration.
 */
export function useLocationPublicStatus(loc: LocationItem): PublicHoursStatus | null {
  const [status, setStatus] = useState<PublicHoursStatus | null>(null);

  useLayoutEffect(() => {
    const tick = () => setStatus(getLocationPublicStatus(loc));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [loc]);

  return status;
}
