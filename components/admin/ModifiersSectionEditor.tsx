"use client";

import { useCallback, useEffect, useState } from "react";
import { adminInputClass, adminLabelClass, adminSectionClass } from "@/components/admin/admin-form-styles";

type Modifier = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  amount: number;
  sort_order: number;
};

export function ModifiersSectionEditor() {
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/catalog-menu/modifiers", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean; modifiers?: Modifier[]; error?: string };
    if (!res.ok) {
      setMsg(data.error ?? "Failed to load");
      return;
    }
    setModifiers(data.modifiers ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRow(m: Modifier) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/catalog-menu/modifiers/${encodeURIComponent(m.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          amount: m.amount,
          sortOrder: m.sort_order,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "Save failed");
        return;
      }
      setMsg(`Saved ${m.name}.`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  function update(id: string, patch: Partial<Modifier>) {
    setModifiers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  const kinds = ["meat", "side", "topping"] as const;
  const kindLabel: Record<string, string> = {
    meat: "Meats",
    side: "Sides",
    topping: "Toppings",
  };

  return (
    <section id="modifiers" className={adminSectionClass}>
      <h2 className="font-display text-2xl text-cream">Modifiers</h2>
      <p className="mt-2 text-sm text-cream/60">
        Global meat upcharges, sides, and toppings — used in the order options modal.
      </p>
      {msg ? (
        <p className="mt-4 rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-cream/85">
          {msg}
        </p>
      ) : null}
      <div className="mt-6 space-y-8">
        {kinds.map((kind) => {
          const rows = modifiers.filter((m) => m.kind === kind);
          if (rows.length === 0) return null;
          return (
            <div key={kind}>
              <h3 className="text-sm font-semibold uppercase tracking-editorial text-cream/70">
                {kindLabel[kind] ?? kind}
              </h3>
              <ul className="mt-3 space-y-3">
                {rows.map((m) => (
                  <li
                    key={m.id}
                    className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_100px_80px_auto]"
                  >
                    <label className={adminLabelClass}>
                      Name
                      <input
                        className={adminInputClass}
                        value={m.name}
                        onChange={(e) => update(m.id, { name: e.target.value })}
                      />
                    </label>
                    <label className={adminLabelClass}>
                      Price (+$)
                      <input
                        className={adminInputClass}
                        type="number"
                        step="0.01"
                        value={m.amount}
                        onChange={(e) =>
                          update(m.id, { amount: Number(e.target.value) || 0 })
                        }
                      />
                    </label>
                    <label className={adminLabelClass}>
                      Order
                      <input
                        className={adminInputClass}
                        type="number"
                        value={m.sort_order}
                        onChange={(e) =>
                          update(m.id, { sort_order: Number(e.target.value) || 0 })
                        }
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void saveRow(m)}
                        className="rounded-full border border-angie-orange/50 px-3 py-2 text-[10px] uppercase tracking-editorial text-angie-orange hover:bg-angie-orange/10 disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
