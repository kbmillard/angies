interface Leaf {
  leftPct: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  blur: number;
}

const LEAVES: Leaf[] = [
  { leftPct: 10, duration: 22, delay: 0, size: 22, opacity: 0.22, blur: 0 },
  { leftPct: 28, duration: 28, delay: -7, size: 14, opacity: 0.16, blur: 1.5 },
  { leftPct: 46, duration: 19, delay: -13, size: 26, opacity: 0.24, blur: 0 },
  { leftPct: 66, duration: 25, delay: -3, size: 16, opacity: 0.18, blur: 1 },
  { leftPct: 85, duration: 21, delay: -16, size: 20, opacity: 0.2, blur: 0 },
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
      aria-hidden
    >
      <path d="M9 0C4 4 0 8 0 14c0 5 4 8 9 8s9-3 9-8c0-6-4-10-9-14zM9 4c3 3 6 6 6 10 0 3-3 6-6 6s-6-3-6-6c0-4 3-7 6-10z" />
    </svg>
  );
}

export default function HeroLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-drift"
          style={{
            left: `${leaf.leftPct}%`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
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
