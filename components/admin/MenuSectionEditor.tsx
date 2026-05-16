"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/menu/schema";
import { MENU_CATEGORY_META } from "@/lib/menu/category-meta";
import { ImageAttachField } from "@/components/admin/ImageAttachField";
import { adminInputClass, adminLabelClass, adminSectionClass } from "@/components/admin/admin-form-styles";

type MeatPriceRow = { meatSlug: string; price: string };

function categorySlugForLabel(label: string): string {
  return MENU_CATEGORY_META.find((c) => c.label.toLowerCase() === label.toLowerCase())?.id ?? label.toLowerCase();
}

export function MenuSectionEditor() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const [meatPrices, setMeatPrices] = useState<MeatPriceRow[]>([]);
  const [meats, setMeats] = useState<{ slug: string; name: string; amount: number }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setMsg(null);
    const [menuRes, modRes] = await Promise.all([
      fetch("/api/admin/menu", { credentials: "include" }),
      fetch("/api/admin/catalog-menu/modifiers", { credentials: "include" }),
    ]);
    const menuData = (await menuRes.json()) as { ok?: boolean; items?: MenuItem[]; error?: string };
    if (!menuRes.ok) {
      setMsg(menuData.error ?? `Error ${menuRes.status}`);
      return;
    }
    setItems(menuData.items ?? []);

    const modData = (await modRes.json()) as {
      ok?: boolean;
      modifiers?: { kind: string; slug: string; name: string; amount: number }[];
    };
    if (modRes.ok && modData.modifiers) {
      setMeats(modData.modifiers.filter((m) => m.kind === "meat"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function selectItem(item: MenuItem) {
    setDraft({ ...item });
    setMsg(null);
    let meatList = meats;
    if (meatList.length === 0) {
      const modRes = await fetch("/api/admin/catalog-menu/modifiers", { credentials: "include" });
      const modData = (await modRes.json()) as {
        modifiers?: { kind: string; slug: string; name: string; amount: number }[];
      };
      meatList = (modData.modifiers ?? []).filter((m) => m.kind === "meat");
      setMeats(meatList);
    }
    const res = await fetch(
      `/api/admin/catalog-menu/items/${encodeURIComponent(item.id)}/meat-prices`,
      { credentials: "include" },
    );
    const data = (await res.json()) as {
      ok?: boolean;
      meatPrices?: { meatSlug: string; price: number }[];
    };
    const overrides = new Map((data.meatPrices ?? []).map((p) => [p.meatSlug, p.price]));
    setMeatPrices(
      meatList.map((m) => ({
        meatSlug: m.slug,
        price: overrides.has(m.slug) ? String(overrides.get(m.slug)) : "",
      })),
    );
  }

  async function saveItem() {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/catalog-menu/items/${encodeURIComponent(draft.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description ?? "",
          basePrice: draft.price ?? 0,
          requiresMeatSelection: draft.meatChoiceRequired,
          imageUrl: draft.imageUrl?.trim() || null,
          imageAlt: draft.imageAlt?.trim() || null,
          active: draft.active,
          featured: draft.featured,
          sortOrder: draft.sortOrder,
          categorySlug: categorySlugForLabel(draft.category),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; item?: MenuItem };
      if (!res.ok) {
        setMsg(data.error ?? "Save failed");
        return;
      }

      if (draft.meatChoiceRequired && meats.length > 0) {
        const mpRes = await fetch(
          `/api/admin/catalog-menu/items/${encodeURIComponent(draft.id)}/meat-prices`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prices: meatPrices.map((r) => ({
                meatSlug: r.meatSlug,
                price: r.price.trim() === "" ? null : Number(r.price),
              })),
            }),
          },
        );
        const mpData = (await mpRes.json()) as { ok?: boolean; error?: string };
        if (!mpRes.ok) {
          setMsg(mpData.error ?? "Meat prices save failed");
          return;
        }
      }

      setMsg("Saved. Refresh the home page to see menu changes.");
      await load();
      if (data.item) setDraft(data.item);
    } finally {
      setBusy(false);
    }
  }

  async function importFinalBundled() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/menu-import-final", { method: "POST", credentials: "include" });
      const d = (await r.json()) as { ok?: boolean; error?: string; items?: number };
      if (!r.ok) {
        setMsg(d.error ?? "Import failed");
        return;
      }
      setMsg(`Loaded menu.json (${d.items ?? 0} items).`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function importJson() {
    if (!importFile) {
      setMsg("Choose a .json file first.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const text = await importFile.text();
      const r = await fetch("/api/admin/menu-import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      const d = (await r.json()) as { ok?: boolean; error?: string; items?: number };
      if (!r.ok) {
        setMsg(d.error ?? "Import failed");
        return;
      }
      setMsg(`Imported ${d.items ?? 0} items.`);
      setImportFile(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="menu" className={adminSectionClass}>
      <h2 className="font-display text-2xl text-cream">Menu</h2>
      <p className="mt-2 text-sm text-cream/60">Edit names, prices, descriptions, and photos. Saves to the live menu API.</p>

      {msg ? (
        <p className="mt-4 rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-cream/85">{msg}</p>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <h3 className="text-sm font-medium text-cream/80">Items ({items.length})</h3>
          <ul className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => void selectItem(it)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    draft?.id === it.id
                      ? "bg-angie-orange/25 text-cream"
                      : "text-cream/75 hover:bg-white/5"
                  }`}
                >
                  <span className="block truncate font-medium">{it.name}</span>
                  <span className="block truncate text-xs text-cream/50">{it.category}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
          {draft ? (
            <>
              <h3 className="font-display text-lg text-cream">Edit: {draft.name}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={adminLabelClass}>
                  Name
                  <input
                    className={adminInputClass}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </label>
                <label className={adminLabelClass}>
                  Category
                  <select
                    className={adminInputClass}
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  >
                    {MENU_CATEGORY_META.map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={adminLabelClass}>
                  Price (USD)
                  <input
                    className={adminInputClass}
                    value={draft.price ?? ""}
                    onChange={(e) => {
                      const t = e.target.value.trim();
                      setDraft({ ...draft, price: t === "" ? null : Number(t.replace(/[$,]/g, "")) });
                    }}
                  />
                </label>
                <label className={adminLabelClass}>
                  Sort order
                  <input
                    type="number"
                    className={adminInputClass}
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </label>
                <label className={`sm:col-span-2 ${adminLabelClass}`}>
                  Description
                  <textarea
                    className={`${adminInputClass} min-h-[88px]`}
                    value={draft.description ?? ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </label>
              </div>
              <ImageAttachField
                label="Menu photo"
                value={draft.imageUrl ?? ""}
                alt={draft.imageAlt ?? ""}
                onChange={(url) => setDraft({ ...draft, imageUrl: url || undefined })}
                onAltChange={(alt) => setDraft({ ...draft, imageAlt: alt })}
              />
              <div className="flex flex-wrap gap-4 text-xs text-cream/80">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.meatChoiceRequired}
                    onChange={(e) =>
                      setDraft({ ...draft, meatChoiceRequired: e.target.checked })
                    }
                  />
                  Requires meat choice
                </label>
              </div>
              {draft.meatChoiceRequired && meats.length > 0 ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-editorial text-cream/65">
                    Meat price overrides (blank = use default upcharge)
                  </h4>
                  <div className="mt-2 space-y-2">
                    {meatPrices.map((row, idx) => {
                      const meat = meats.find((m) => m.slug === row.meatSlug);
                      return (
                        <div key={row.meatSlug} className="flex items-center gap-3">
                          <span className="min-w-[120px] text-sm text-cream/80">
                            {meat?.name ?? row.meatSlug}
                          </span>
                          <input
                            className="w-28 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-sm text-cream"
                            placeholder={meat ? String(meat.amount) : "0"}
                            value={row.price}
                            onChange={(e) => {
                              const next = [...meatPrices];
                              next[idx] = { ...row, price: e.target.value };
                              setMeatPrices(next);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveItem()}
                className="rounded-full bg-angie-orange px-6 py-2.5 text-xs font-semibold uppercase tracking-editorial text-cream disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save item"}
              </button>
            </>
          ) : (
            <p className="text-sm text-cream/55">Select an item from the list.</p>
          )}
        </div>
      </div>

      <details className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-editorial text-cream/70">
          Advanced: import menu JSON
        </summary>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void importFinalBundled()}
            className="rounded-full bg-gold/90 px-4 py-2 text-xs font-semibold uppercase tracking-editorial text-charcoal disabled:opacity-40"
          >
            Load site menu.json
          </button>
          <input
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="text-sm text-cream/80 file:mr-3 file:rounded-full file:border-0 file:bg-angie-orange file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream"
          />
          <button
            type="button"
            disabled={busy || !importFile}
            onClick={() => void importJson()}
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 disabled:opacity-40"
          >
            Import file
          </button>
        </div>
      </details>
    </section>
  );
}
