import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const ORBIT =
  "Angie's Fresh Food · Kansas City · Tex-Mex · Open the window · ";

interface HeroBadgeProps {
  orbitText?: string;
  logoSrc?: string;
  className?: string;
}

export default function HeroBadge({
  orbitText = ORBIT,
  logoSrc = "/images/brand/site-logo.webp",
  className = "w-[clamp(220px,28vw,320px)]",
}: HeroBadgeProps) {
  const pathId = "hero-badge-orbit";

  return (
    <div
      className={cn("relative aspect-square opacity-0 animate-rise", className)}
      style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-[15%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(246, 162, 26, 0.10) 0%, rgba(247, 84, 45, 0.05) 40%, transparent 70%)",
        }}
      />

      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute inset-0"
        aria-hidden
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

      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 z-0 animate-spin28"
        style={{ willChange: "transform" }}
      >
        <defs>
          <path
            id={pathId}
            d="M 100,100 m -85,0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"
          />
        </defs>
        <text
          fill="var(--gold, #f6a21a)"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            {orbitText}
          </textPath>
        </text>
      </svg>

      <div
        className="absolute inset-[20%] z-10 animate-bob"
        style={{ filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45))" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-charcoal">
          <Image
            src={logoSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 320px, 220px"
            className="object-contain p-[8%]"
          />
        </div>
      </div>
    </div>
  );
}
