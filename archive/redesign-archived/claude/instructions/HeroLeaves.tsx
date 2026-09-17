// components/hero/HeroLeaves.tsx
// ──────────────────────────────────────────────────────────────────────────────
// FIX-01: replaces the previous version, which had a CSS conflict — inline
// `transform: scale(N)` per leaf overrode the keyframe's `transform: translate +
// rotate`, so leaves stopped moving and bunched at the bottom of the hero.
//
// Changes:
//   1. Animation now uses ONLY `transform` (no `bottom`). Each leaf starts
//      visually below the container via translate3d(0, 100%, 0) and drifts
//      up by 100vh + its own height.
//   2. Per-leaf size is set via width/height inline (no transform scale).
//   3. Per-leaf opacity is exposed via the --leaf-opacity custom property
//      so the keyframe can fade in/out without hardcoding a single value.
//   4. 5 leaves instead of 6 — less crowded, more atmospheric.
//   5. Slight blur on smaller leaves so they read as background atmosphere
//      rather than graphic stickers.
//
// REQUIRES: the updated `drift` keyframe in globals.css AND tailwind.config.ts
//           (see fixes-01/README.md).
// ──────────────────────────────────────────────────────────────────────────────

interface Leaf {
  leftPct: number;
  duration: number; // seconds
  delay: number;    // seconds (negative for staggered already-running starts)
  size: number;     // px — width
  opacity: number;  // 0..1
  blur: number;     // px — 0 = sharp, higher = softer/further-feeling
}

const LEAVES: Leaf[] = [
  { leftPct: 10, duration: 22, delay:   0, size: 22, opacity: 0.22, blur: 0   },
  { leftPct: 28, duration: 28, delay:  -7, size: 14, opacity: 0.16, blur: 1.5 },
  { leftPct: 46, duration: 19, delay: -13, size: 26, opacity: 0.24, blur: 0   },
  { leftPct: 66, duration: 25, delay:  -3, size: 16, opacity: 0.18, blur: 1   },
  { leftPct: 85, duration: 21, delay: -16, size: 20, opacity: 0.20, blur: 0   },
];

function LeafShape({ size, opacity, blur }: { size: number; opacity: number; blur: number }) {
  return (
    <svg
      viewBox="0 0 18 22"
      width={size}
      height={(size * 22) / 18}
      style={{
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
      className="block fill-accent-green"
      aria-hidden="true"
    >
      <path d="M9 0C4 4 0 8 0 14c0 5 4 8 9 8s9-3 9-8c0-6-4-10-9-14zM9 4c3 3 6 6 6 10 0 3-3 6-6 6s-6-3-6-6c0-4 3-7 6-10z" />
    </svg>
  );
}

export default function HeroLeaves() {
  return (
    <div
      className="absolute inset-0 z-[2] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-drift"
          style={{
            left: `${leaf.leftPct}%`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            // Expose opacity to the keyframe so it can fade in/out without
            // hardcoding a single value per leaf
            ["--leaf-opacity" as string]: leaf.opacity.toString(),
            willChange: "transform, opacity",
          }}
        >
          <LeafShape size={leaf.size} opacity={leaf.opacity} blur={leaf.blur} />
        </span>
      ))}
    </div>
  );
}
