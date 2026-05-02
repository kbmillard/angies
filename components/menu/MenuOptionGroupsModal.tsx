"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { MenuItem, MenuOptionGroup } from "@/lib/menu/schema";
import { optionSelectionsComplete } from "@/lib/menu/option-groups";

type Props = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selections: Record<string, string>) => void;
};

export function MenuOptionGroupsModal({ item, open, onOpenChange, onConfirm }: Props) {
  const titleId = useId();
  const groups = item?.optionGroups ?? [];
  const [sel, setSel] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && item) {
      const init: Record<string, string> = {};
      for (const g of item.optionGroups ?? []) {
        if (!g.required && g.options[0]) init[g.id] = g.options[0]!;
      }
      setSel(init);
    }
  }, [open, item]);

  const complete = useMemo(
    () => (item ? optionSelectionsComplete(item, sel) : false),
    [item, sel],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange, open]);

  if (!open || !item || groups.length === 0) return null;

  const setGroup = (g: MenuOptionGroup, value: string) => {
    setSel((prev) => ({ ...prev, [g.id]: value }));
  };

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
        aria-label="Close options"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[86] w-full max-w-md rounded-t-2xl border border-white/10 bg-charcoal p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p id={titleId} className="font-display text-2xl text-cream">
              Choose options
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
        <div className="max-h-[50vh] space-y-6 overflow-y-auto pr-1">
          {groups.map((g) => (
            <div key={g.id}>
              <p className="text-xs uppercase tracking-editorial text-cream/50">
                {g.label}
                {g.required ? <span className="text-salsa"> *</span> : null}
              </p>
              <ul className="mt-2 space-y-1">
                {g.options.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      className={
                        sel[g.id] === opt
                          ? "w-full rounded-xl border border-cream/50 bg-cream/10 px-4 py-3 text-left text-sm text-cream"
                          : "w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-cream hover:border-cream/40 hover:bg-white/5"
                      }
                      onClick={() => setGroup(g, opt)}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={!complete}
          className="mt-6 w-full rounded-full bg-salsa py-3 text-sm font-semibold uppercase tracking-editorial text-cream disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => {
            if (!complete) return;
            onConfirm(sel);
            onOpenChange(false);
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
