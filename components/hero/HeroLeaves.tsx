// components/hero/HeroLeaves.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Six cilantro leaves drifting upward through the hero. Decorative only.
//
// Server component — pure SVG + CSS animation. Reduced-motion handled by
// the global guard in globals.css.
//
// USAGE: Render inside the hero, on a layer ABOVE the slideshow but BELOW
// the content. Suggested z-index: z-[2] with pointer-events-none.
// ──────────────────────────────────────────────────────────────────────────────

interface Leaf {
  leftPct: number;
  duration: number; // seconds
  delay: number;    // seconds (negative for staggered start)
  scale: number;
}

const LEAVES: Leaf[] = [
  { leftPct:  8, duration: 16, delay:  0,   scale: 1.0  },
  { leftPct: 22, duration: 19, delay: -4,   scale: 0.7  },
  { leftPct: 38, duration: 14, delay: -9,   scale: 1.1  },
  { leftPct: 55, duration: 22, delay: -2,   scale: 0.85 },
  { leftPct: 72, duration: 17, delay: -11,  scale: 0.6  },
  { leftPct: 88, duration: 20, delay: -6,   scale: 0.9  },
];

function LeafShape() {
  return (
    <svg
      viewBox="0 0 18 22"
      className="w-[18px] h-[22px] fill-accent-green opacity-30"
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
          className="absolute bottom-0 block h-[22px] w-[18px] animate-drift will-change-[transform,opacity,bottom]"
          style={{
            left: `${leaf.leftPct}%`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            transform: `scale(${leaf.scale})`,
          }}
        >
          <LeafShape />
        </span>
      ))}
    </div>
  );
}
