import type { ReactNode } from "react";
import BrandTicker from "@/components/redesign/marquee/BrandTicker";
import { EditorialNav } from "@/components/redesign/nav/EditorialNav";
import { FixedBrandBackdrop } from "@/components/redesign/prologue/FixedBrandBackdrop";

interface PageShellProps {
  children: ReactNode;
}

/**
 * Home page Z-stack — see claude/new/SCROLL-AND-MOTION.md § A–D.
 * Watermark (fixed z-0) → sticky ticker/nav → scrolling main (z-10).
 */
export function PageShell({ children }: PageShellProps) {
  return (
    <>
      <FixedBrandBackdrop />
      <BrandTicker />
      <EditorialNav />
      <main className="relative z-10">{children}</main>
    </>
  );
}
