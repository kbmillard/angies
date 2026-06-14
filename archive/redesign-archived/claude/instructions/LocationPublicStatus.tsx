// components/locations/LocationPublicStatus.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file.
//
// Same public API (status: "open" | "closed" with optional detail text),
// but the OPEN dot now has a radiating ring (CSS keyframe `ringPulse`).
// CLOSED state stays static — the ring should only suggest "we're live."
//
// Hex used by the ringPulse keyframe (rgba(69, 184, 46, 0.55)) matches the
// `accent-green` Tailwind token in your config.
// ──────────────────────────────────────────────────────────────────────────────

import React from "react";

export type LocationStatus = "open" | "closed";

interface LocationPublicStatusProps {
  status: LocationStatus;
  /** Optional detail line (e.g. "Back at 10 AM Wednesday"). */
  detail?: string;
  /** Tailwind text-size for the status label. Default "text-xs". */
  size?: "xs" | "sm";
  className?: string;
}

export default function LocationPublicStatus({
  status,
  detail,
  size = "xs",
  className = "",
}: LocationPublicStatusProps) {
  const isOpen = status === "open";

  const labelText = isOpen ? "Open now" : "Closed";
  const sizeClass = size === "sm" ? "text-sm" : "text-[11px]";

  return (
    <div
      className={`inline-flex flex-col items-start gap-1.5 ${className}`.trim()}
    >
      <span
        className={`inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 font-sans font-semibold uppercase tracking-[0.28em] ${sizeClass} ${
          isOpen
            ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
            : "border-salsa/30 bg-salsa/10 text-salsa"
        }`}
      >
        {/* The pulsing ring lives on the dot via CSS keyframe `ringPulse`.
            We only apply the animation when status is open. */}
        <span
          className={`block h-[7px] w-[7px] rounded-full ${
            isOpen ? "bg-accent-green animate-ring-pulse" : "bg-salsa"
          }`}
          aria-hidden="true"
        />
        {labelText}
      </span>

      {detail && !isOpen && (
        <span className="t-micro text-cream/70 normal-case tracking-normal">
          {detail}
        </span>
      )}
    </div>
  );
}
