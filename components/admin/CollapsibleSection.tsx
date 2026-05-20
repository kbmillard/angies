"use client";

import { useState, useEffect, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type CollapsibleSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const storageKey = `admin-section-v2-${id}`;
  
  // Initialize from localStorage
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === "true" : defaultOpen;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-6 rounded-2xl border border-white/10 bg-charcoal/80 p-8 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left group"
      >
        <h2 className="font-display text-2xl text-cream group-hover:text-white transition-colors">
          {title}
        </h2>
        <div className="ml-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-cream group-hover:border-white/20 group-hover:bg-black/60 transition-colors">
          {isOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>
      </button>
      
      {isOpen && <div className="mt-6">{children}</div>}
    </section>
  );
}
