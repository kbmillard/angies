"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";
import { meatChoices } from "@/lib/menu/schema";
import type { MenuItem } from "@/lib/menu/schema";

type Props = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (meat: string) => void;
};

export function MeatChoiceModal({ item, open, onOpenChange, onConfirm }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange, open]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close meat choice"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[86] w-full max-w-md rounded-t-2xl border border-white/10 bg-charcoal p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p id={titleId} className="font-display text-2xl text-cream">
              Choose an option
            </p>
            <p className="mt-1 text-sm text-cream/70">{item.name}</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 p-2 text-cream hover:bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="max-h-[50vh] space-y-1 overflow-y-auto pr-1">
          {meatChoices.map((m) => (
            <li key={m}>
              <button
                type="button"
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-cream hover:border-cream/40 hover:bg-white/5"
                onClick={() => {
                  onConfirm(m);
                  onOpenChange(false);
                }}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
