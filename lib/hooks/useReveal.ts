// lib/hooks/useReveal.ts
// ──────────────────────────────────────────────────────────────────────────────
// Returns a ref to attach to any element and a boolean that flips to true
// when the element enters the viewport. Used by <Reveal /> wrapper but also
// available for direct use if a component needs in-line reveal logic.
//
// Behavior:
//   - Single-shot (unobserve once in view)
//   - 12% threshold
//   - -8% bottom rootMargin so reveal happens slightly before the element
//     hits the fold
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseRevealOptions {
  /** 0..1 — fraction of element visible before triggering. Default 0.12. */
  threshold?: number;
  /** CSS rootMargin string. Default "0px 0px -8% 0px". */
  rootMargin?: string;
  /** If true, will re-fire when scrolling back out and in. Default false. */
  repeat?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
): [RefObject<T | null>, boolean] {
  const {
    threshold = 0.12,
    rootMargin = "0px 0px -8% 0px",
    repeat = false,
  } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // SSR safety
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, repeat]);

  return [ref, inView];
}
