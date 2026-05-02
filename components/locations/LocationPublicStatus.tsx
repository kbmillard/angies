"use client";

import { useLayoutEffect } from "react";
import clsx from "clsx";
import type { LocationItem } from "@/lib/locations/schema";
import { getLocationPublicStatus } from "@/lib/locations/hours";
import { useLocationPublicStatus } from "@/lib/locations/use-location-public-status";

const devStatusLoggedIds = new Set<string>();

function labelColorClass(isOpen: boolean): string {
  return isOpen ? "text-accent-green" : "text-salsa";
}

export type LocationPublicStatusProps = {
  location: LocationItem;
  className?: string;
  /** Visual preset for cards vs truck block vs map embed. */
  variant?: "card" | "truck" | "map";
  showNote?: boolean;
};

/**
 * Public open/closed line from `getLocationPublicStatus` — never renders raw `location.status`
 * as the primary label (sheet `Open` is not trusted; overrides are handled in `hours.ts`).
 */
export function LocationPublicStatus({
  location,
  className,
  variant = "card",
  showNote = true,
}: LocationPublicStatusProps) {
  const publicStatus = useLocationPublicStatus(location);
  const pending = publicStatus === null;
  const note = location.statusNote?.trim();

  useLayoutEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (devStatusLoggedIds.has(location.id)) return;
    devStatusLoggedIds.add(location.id);
    const now = new Date();
    const tz = location.timezone?.trim() || "America/Chicago";
    const zonedNow = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now);
    const computed = getLocationPublicStatus(location, now);
    console.log("[Location status check]", {
      name: location.name,
      rawStatus: location.status?.trim() ?? "",
      computedLabel: computed.label,
      computedDetail: computed.detail,
      zonedNow,
    });
  }, [location]);

  if (variant === "truck") {
    return (
      <div className={className}>
        {pending ? (
          <p className="font-display text-3xl text-cream/50">Checking hours…</p>
        ) : (
          <>
            <p className={clsx("font-display text-3xl", labelColorClass(publicStatus.isOpen))}>
              {publicStatus.label}
            </p>
            {publicStatus.detail ? (
              <p className="mt-2 max-w-xl text-lg font-normal leading-snug text-cream/80">
                {publicStatus.detail}
              </p>
            ) : null}
          </>
        )}
        {showNote && note ? (
          <p className="mt-2 max-w-xl text-sm text-cream/75">{note}</p>
        ) : null}
      </div>
    );
  }

  if (variant === "map") {
    return (
      <div className={clsx("mt-2 space-y-1 text-xs text-cream/80", className)}>
        <p>
          {pending ? (
            <span className="text-cream/50">Checking hours…</span>
          ) : (
            <>
              <span className={clsx("font-semibold", labelColorClass(publicStatus.isOpen))}>
                {publicStatus.label}
              </span>
              {publicStatus.detail ? <span> · {publicStatus.detail}</span> : null}
            </>
          )}
        </p>
        {showNote && note ? <p className="text-cream/65">{note}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mt-3 text-xs text-cream/90">
        {pending ? (
          <span className="text-cream/50">Checking hours…</span>
        ) : (
          <>
            <span className={clsx("font-semibold", labelColorClass(publicStatus.isOpen))}>
              {publicStatus.label}
            </span>
            {publicStatus.detail ? <span className="text-cream/80"> · {publicStatus.detail}</span> : null}
          </>
        )}
      </p>
      {showNote && note ? <p className="mt-1 text-xs text-cream/75">{note}</p> : null}
    </div>
  );
}
