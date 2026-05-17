// Spinning circular-text stamp: logo centered, gold orbit text on a 28s loop.

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
      {/* Orbiting text — spins; sits behind the logo */}
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
            letterSpacing: "0.4em",
            textTransform: "uppercase",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            {orbitText}
          </textPath>
        </text>
      </svg>

      {/* Logo disc — opaque so the fixed watermark does not bleed through */}
      <div className="absolute inset-[18%] z-10 flex items-center justify-center">
        <div
          className="relative h-full w-full animate-bob overflow-hidden rounded-full bg-charcoal shadow-[0_0_32px_rgba(247,84,45,0.35)] ring-1 ring-white/10"
          style={{ filter: "drop-shadow(0 0 24px rgba(247, 84, 45, 0.35))" }}
        >
          <Image
            src={logoSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 220px, 180px"
            className="object-contain p-[8%]"
          />
        </div>
      </div>
    </div>
  );
}
