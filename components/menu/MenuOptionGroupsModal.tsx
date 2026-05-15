"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { MenuItem, MenuOptionGroup } from "@/lib/menu/schema";
import {
  optionSelectionsComplete,
  type OptionSelections,
} from "@/lib/menu/option-groups";
import { useScrollLock } from "@/lib/utils/use-scroll-lock";

type Props = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selections: OptionSelections) => void;
};

function initSelections(item: MenuItem): OptionSelections {
  const init: OptionSelections = {};
  for (const g of item.optionGroups ?? []) {
    if (g.multiple) init[g.id] = [];
    else init[g.id] = "";
  }
  return init;
}

export function MenuOptionGroupsModal({ item, open, onOpenChange, onConfirm }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const groups = item?.optionGroups ?? [];
  const [sel, setSel] = useState<OptionSelections>({});

  const dialogOpen =
    open && Boolean(item) && (item?.optionGroups?.length ?? 0) > 0;

  useEffect(() => setMounted(true), []);

  useScrollLock(mounted && dialogOpen);

  useEffect(() => {
    if (open && item) {
      setSel(initSelections(item));
    }
  }, [open, item]);

  const complete = useMemo(
    () => (item ? optionSelectionsComplete(item, sel) : false),
    [item, sel],
  );

  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen, onOpenChange]);

  if (!mounted || !dialogOpen || !item) return null;

  const setSingle = (g: MenuOptionGroup, value: string) => {
    setSel((prev) => ({ ...prev, [g.id]: value }));
  };

  const toggleMulti = (g: MenuOptionGroup, opt: string) => {
    setSel((prev) => {
      const raw = prev[g.id];
      const cur = Array.isArray(raw) ? raw : [];
      const has = cur.includes(opt);
      const next = has ? cur.filter((x) => x !== opt) : [...cur, opt];
      return { ...prev, [g.id]: next };
    });
  };

  const isMultiSelected = (g: MenuOptionGroup, opt: string) => {
    const raw = sel[g.id];
    return Array.isArray(raw) && raw.includes(opt);
  };

  const isSingleSelected = (g: MenuOptionGroup, opt: string) => sel[g.id] === opt;

  return createPortal(
    <div
      className="fixed inset-0 z-[85] flex min-h-0 items-center justify-center overflow-x-hidden overflow-y-auto p-4 sm:p-6"
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
      <div className="relative z-[86] my-auto flex w-full max-w-md min-h-0 max-h-[min(85dvh,720px)] flex-col rounded-2xl border border-white/10 bg-charcoal shadow-2xl sm:max-h-[85vh]">
        <div className="min-h-0 shrink-0 p-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <p id={titleId} className="font-display text-2xl text-cream">
                Choose options
              </p>
              <p className="mt-1 truncate text-sm text-cream/70">{item.name}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border border-white/10 p-2 text-cream hover:bg-white/5"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 pb-2">
          {groups.map((g) => (
            <div key={g.id} className="min-w-0">
              <p className="text-xs uppercase tracking-editorial text-cream/50">
                {g.label}
                {g.required ? <span className="text-salsa"> *</span> : null}
                {g.multiple ? (
                  <span className="ml-1.5 font-normal normal-case text-cream/40">(select any)</span>
                ) : null}
              </p>
              <ul className="mt-2 space-y-1">
                {g.options.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      className={
                        g.multiple
                          ? isMultiSelected(g, opt)
                            ? "w-full rounded-xl border border-cream/50 bg-cream/10 px-4 py-3 text-left text-sm text-cream"
                            : "w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-cream hover:border-cream/40 hover:bg-white/5"
                          : isSingleSelected(g, opt)
                            ? "w-full rounded-xl border border-cream/50 bg-cream/10 px-4 py-3 text-left text-sm text-cream"
                            : "w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-cream hover:border-cream/40 hover:bg-white/5"
                      }
                      onClick={() => (g.multiple ? toggleMulti(g, opt) : setSingle(g, opt))}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="shrink-0 border-t border-white/10 p-6 pt-4">
          <button
            type="button"
            disabled={!complete}
            className="w-full rounded-full bg-angie-orange py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-sm transition hover:bg-angie-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              if (!complete) return;
              onConfirm(sel);
              onOpenChange(false);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
