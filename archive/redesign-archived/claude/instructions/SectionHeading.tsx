// components/ui/SectionHeading.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file. Same props as before (kicker, title, subtitle),
// but emits the new `.t-kicker`, `.t-section`, and `.t-body-lg` role classes
// from globals.css for consistent typography across all sections.
//
// Title supports inline emphasis via <em> — the `.t-section em` rule in
// globals.css will apply the SOFT-axis italic and gold accent automatically.
//
// USAGE:
//   <SectionHeading
//     kicker="Our story"
//     title={<>Mexican flavor, <em>rolling through</em> Kansas City.</>}
//     subtitle="Bright truck, fresh masa energy."
//   />
// ──────────────────────────────────────────────────────────────────────────────

import React from "react";

interface SectionHeadingProps {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** "gold" (default) or "orange" tint for the kicker. */
  kickerTint?: "gold" | "orange" | "muted";
  /** Center-align the whole heading group. */
  center?: boolean;
  /** Extra class names on the wrapping element. */
  className?: string;
  /** Constrain max width — defaults to a comfortable 56ch. */
  maxWidthClass?: string;
}

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  kickerTint = "gold",
  center = false,
  className = "",
  maxWidthClass = "max-w-2xl",
}: SectionHeadingProps) {
  const kickerClass =
    kickerTint === "gold"
      ? "t-kicker t-kicker-gold"
      : kickerTint === "orange"
        ? "t-kicker t-kicker-orange"
        : "t-kicker";

  return (
    <div
      className={`flex flex-col gap-4 ${maxWidthClass} ${center ? "mx-auto text-center" : ""} ${className}`.trim()}
    >
      {kicker && <div className={kickerClass}>{kicker}</div>}
      <h2 className="t-section">{title}</h2>
      {subtitle && <p className="t-body-lg">{subtitle}</p>}
    </div>
  );
}
