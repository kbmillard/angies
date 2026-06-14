// components/locations/MapPinRadar.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Animated map pin with three radiating rings (radar ping).
//
// Server component — pure CSS animation.
//
// USAGE: Drop into the map placeholder area of LocationsSection.tsx. Replaces
// the static `border-dashed border-white/20 bg-charcoal/60` placeholder, or
// overlay on top of a real map iframe if you wire one up later.
//
// Renders a styled "map look" (grid + atmospheric gradient) so it doesn't
// require an actual maps API key. Swap the inner background-image for a real
// map tile later if needed.
// ──────────────────────────────────────────────────────────────────────────────

export default function MapPinRadar() {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(247, 84, 45, 0.18), transparent 50%), linear-gradient(135deg, #1a1d24 0%, #0d0f13 100%)",
      }}
      aria-hidden="true"
    >
      {/* Subtle "map grid" texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radar rings — three concentric pings, staggered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-angie-orange animate-radar-ping"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-angie-orange animate-radar-ping"
          style={{ animationDelay: "1s" }}
        />
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-angie-orange animate-radar-ping"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Map pin — bobs gently */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
        <svg
          className="text-angie-orange animate-bob"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            filter: "drop-shadow(0 4px 12px rgba(247, 84, 45, 0.6))",
          }}
          aria-hidden="true"
        >
          <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>

        {/* Soft pulsing shadow under the pin */}
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-4 rounded-full bg-black/40 blur-[3px]"
          style={{
            animation: "shadowPulse 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
