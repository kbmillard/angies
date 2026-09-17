// components/hero/HeroBadge.tsx
// ──────────────────────────────────────────────────────────────────────────────
// FIX-01: replaces the previous version, which used a heavy orange drop-shadow
// (`drop-shadow(0 0 24px rgba(247, 84, 45, 0.35))`) that read as a muddy dark
// ring around the logo on the charcoal hero. Refined treatment:
//
//   1. Drop-shadow is now downward-only and dark (depth, not glow).
//   2. NEW: thin gold dashed ring at ~42% radius, sitting just inside the
//      orbiting text. Gives the badge structure as a proper "stamp" mark.
//   3. NEW: subtle radial gradient behind the logo (cream-to-transparent)
//      so the logo doesn't look like it's punched out of nothing — it has
//      a warm halo without the dirty orange-on-charcoal artifact.
//   4. Orbiting text spacing tightened slightly for readability at small size.
// ──────────────────────────────────────────────────────────────────────────────

import Image from "next/image";

interface HeroBadgeProps {
  /** Text that orbits the logo. Repeat your phrase a few times so the path fills. */
  orbitText?: string;
  /** Logo src, defaults to the public path. */
  logoSrc?: string;
  /** Tailwind sizing on the outer wrapper. */
  className?: string;
}

export default function HeroBadge({
  orbitText = "Angies Fresh Food · Kansas City · Tex-Mex · Open the window · ",
  logoSrc = "/images/brand/site-logo.webp",
  className = "w-[220px] sm:w-[280px] lg:w-[320px]",
}: HeroBadgeProps) {
  const pathId = "hero-badge-path";

  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      {/* Soft warm halo BEHIND the logo — replaces the harsh orange drop-shadow.
          Radial gradient fades cream at center to transparent at edge. */}
      <div
        className="absolute inset-[15%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(246, 162, 26, 0.10) 0%, rgba(247, 84, 45, 0.05) 40%, transparent 70%)",
        }}
      />

      {/* Thin dashed inner ring — visual "track" inside the orbiting text.
          Gives the badge a structural anchor without a heavy border. */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke="rgba(246, 162, 26, 0.22)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
      </svg>

      {/* Ring of orbiting text — spins independently of the logo */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 animate-spin28"
        style={{ willChange: "transform" }}
      >
        <defs>
          <path
            id={pathId}
            d="M 100,100 m -85,0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"
          />
        </defs>
        <text
          className="font-sans fill-gold"
          style={{
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          <textPath href={`#${pathId}`}>{orbitText}</textPath>
        </text>
      </svg>

      {/* Logo at center — soft downward shadow for depth, no colored glow.
          Gentle vertical bob keeps it alive without competing with the spin. */}
      <div
        className="absolute inset-[20%] animate-bob"
        style={{
          filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45))",
        }}
      >
        <Image
          src={logoSrc}
          alt=""
          fill
          sizes="320px"
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
