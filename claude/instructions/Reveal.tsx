// components/ui/Reveal.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Drop-in wrapper that fades + lifts its children into view as they scroll
// into the viewport. No-op for users with prefers-reduced-motion (handled
// globally in globals.css).
//
// USAGE:
//   <Reveal>...</Reveal>           // single block reveal
//   <Reveal as="section">...</Reveal>
//   <Reveal stagger>...</Reveal>   // direct children animate one after the other
//
// The CSS for `reveal-init`, `reveal-in`, and `data-stagger` lives in
// app/globals.css (added in globals-additions.css).
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import React, { ElementType, ReactNode } from "react";
import { useReveal } from "@/lib/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  /** Render tag. Defaults to "div". */
  as?: ElementType;
  /** Stagger direct children one after the other. */
  stagger?: boolean;
  /** Additional class names. */
  className?: string;
  /** Pass-through id. */
  id?: string;
}

export default function Reveal({
  children,
  as: Tag = "div",
  stagger = false,
  className = "",
  id,
}: RevealProps) {
  const [ref, inView] = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      id={id}
      data-stagger={stagger ? "" : undefined}
      className={`reveal-init ${inView ? "reveal-in" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
