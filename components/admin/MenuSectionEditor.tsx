"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Check, Pencil, Download } from "lucide-react";
import type { MenuItem } from "@/lib/menu/schema";
import { ImageAttachField } from "@/components/admin/ImageAttachField";
import { adminInputClass, adminSectionClass } from "@/components/admin/admin-form-styles";

type Category = { slug: string; name: string; sort_order: number; item_count: number };
type MeatPriceRow = { meatSlug: string; price: string };

export function MenuSectionEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const [meatPrices, setMeatPrices] = useState<MeatPriceRow[]>([]);
  const [meats, setMeats] = useState<{ slug: string; name: string; amount: number }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCat, setNewItemCat] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);

  const load = useCallback(async () => {
    setMsg(null);
    const [menuRes, modRes, catRes] = await Promise.all([
      fetch("/api/admin/menu", { credentials: "include" }),
      fetch("/api/admin/catalog-menu/modifiers", { credentials: "include" }),
      fetch("/api/admin/catalog-menu/categories", { credentials: "include" }),
    ]);
    const menuData = (await menuRes.json()) as { ok?: boolean; items?: MenuItem[]; error?: string };
    if (!menuRes.ok) {
      setMsg(menuData.error ?? `Error ${menuRes.status}`);
      setLoaded(true);
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

    const catData = (await catRes.json()) as { ok?: boolean; categories?: Category[] };
    if (catRes.ok && catData.categories) {
      setCategories(catData.categories);
      if (!newItemCat && catData.categories[0]) {
        setNewItemCat(catData.categories[0].slug);
      }
    }
    setLoaded(true);
  }, [newItemCat]);

  useEffect(() => {
    void load();
  }, [load]);

  async function importMenu() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/menu-import-final", { method: "POST", credentials: "include" });
      const d = (await r.json()) as { ok?: boolean; error?: string; items?: number };
      if (!r.ok) {
        setMsg(d.error ?? "Import failed");
        return;
      }
      setMsg(`✓ Loaded ${d.items ?? 0} items`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function selectItem(item: MenuItem) {
    setDraft({ ...item });
    setShowNewItem(false);
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

  function getCatSlug(catName: string): string {
    const cat = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    return cat?.slug ?? catName.toLowerCase().replace(/\s+/g, "-");
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
          categorySlug: getCatSlug(draft.category),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; item?: MenuItem };
      if (!res.ok) {
        setMsg(data.error ?? "Error");
        return;
      }

      if (draft.meatChoiceRequired && meats.length > 0) {
        await fetch(
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
      }

      setMsg("✓");
      await load();
      if (data.item) setDraft(data.item);
    } finally {
      setBusy(false);
    }
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/catalog-menu/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        setNewCatName("");
        setShowNewCat(false);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(slug: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/catalog-menu/categories/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "Error");
      }
      setConfirmDeleteCat(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function addItem() {
    if (!newItemName.trim() || !newItemCat) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/catalog-menu/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName.trim(),
          categorySlug: newItemCat,
          basePrice: newItemPrice ? Number(newItemPrice) : 0,
        }),
      });
      if (res.ok) {
        setNewItemName("");
        setNewItemPrice("");
        setShowNewItem(false);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(slug: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/catalog-menu/items/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setConfirmDelete(null);
      if (draft?.id === slug) setDraft(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category.toLowerCase() === cat.name.toLowerCase()),
  }));

  return (
    <section id="menu" className={adminSectionClass}>
      <h2 className="font-display text-2xl text-cream">Menu</h2>

      {msg ? (
        <p className="mt-3 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm text-cream/85">{msg}</p>
      ) : null}

      {/* Load menu button when database is empty */}
      {loaded && items.length === 0 && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-gold/50 bg-gold/10 p-6 text-center">
          <p className="mb-4 text-cream/80">No menu items in database</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void importMenu()}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-charcoal hover:bg-gold/90 disabled:opacity-40"
          >
            <Download className="h-5 w-5" />
            {busy ? "Loading..." : "Load Menu"}
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cream/80">Categories</h3>
          <button
            type="button"
            onClick={() => setShowNewCat(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-angie-orange text-cream hover:bg-angie-orange/80"
            aria-label="Add category"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {showNewCat && (
          <div className="mt-3 flex items-center gap-2">
            <input
              className={`${adminInputClass} flex-1`}
              placeholder="Category name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void addCategory()}
              autoFocus
            />
            <button
              type="button"
              onClick={() => void addCategory()}
              disabled={busy || !newCatName.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white disabled:opacity-40"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => { setShowNewCat(false); setNewCatName(""); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="group flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-sm text-cream/80"
            >
              <span>{cat.name}</span>
              <span className="text-xs text-cream/50">({cat.item_count})</span>
              {cat.item_count === 0 && (
                confirmDeleteCat === cat.slug ? (
                  <button
                    type="button"
                    onClick={() => void deleteCategory(cat.slug)}
                    className="ml-1 text-red-400 hover:text-red-300"
                    title="Confirm delete"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCat(cat.slug)}
                    className="ml-1 text-cream/40 opacity-0 group-hover:opacity-100 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Items by category */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          {/* Add Item button */}
          <button
            type="button"
            onClick={() => { setShowNewItem(true); setDraft(null); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-angie-orange/50 bg-angie-orange/10 py-3 text-sm font-semibold text-angie-orange hover:border-angie-orange hover:bg-angie-orange/20"
          >
            <Plus className="h-5 w-5" />
            <span>+ Item</span>
          </button>

          {/* Items list grouped by category */}
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {grouped.map((cat) => (
              <div key={cat.slug}>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-cream/50">{cat.name}</h4>
                <ul className="space-y-1 rounded-xl border border-white/10 bg-black/25 p-2">
                  {cat.items.length === 0 && (
                    <li className="px-3 py-2 text-xs text-cream/40 italic">No items</li>
                  )}
                  {cat.items.map((it) => (
                    <li key={it.id} className="group flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void selectItem(it)}
                        className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                          draft?.id === it.id
                            ? "bg-angie-orange/25 text-cream"
                            : "text-cream/75 hover:bg-white/5"
                        }`}
                      >
                        <span className="block truncate font-medium">{it.name}</span>
                        <span className="text-xs text-cream/50">
                          {it.price != null ? `$${it.price.toFixed(2)}` : "—"}
                        </span>
                      </button>
                      {confirmDelete === it.id ? (
                        <button
                          type="button"
                          onClick={() => void deleteItem(it.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white"
                          title="Confirm"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(it.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-cream/30 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Edit panel */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          {showNewItem ? (
            <div className="space-y-4">
              <h3 className="font-display text-lg text-cream">+ New Item</h3>
              <input
                className={adminInputClass}
                placeholder="Name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoFocus
              />
              <select
                className={adminInputClass}
                value={newItemCat}
                onChange={(e) => setNewItemCat(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                className={adminInputClass}
                placeholder="Price (optional)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void addItem()}
                  disabled={busy || !newItemName.trim() || !newItemCat}
                  className="flex items-center gap-2 rounded-full bg-angie-orange px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
                >
                  <Check className="h-4 w-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewItem(false); setNewItemName(""); setNewItemPrice(""); }}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-cream/70"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : draft ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-cream">{draft.name}</h3>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="text-cream/50 hover:text-cream"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-cream/60">Name</label>
                  <input
                    className={adminInputClass}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-cream/60">Category</label>
                  <select
                    className={adminInputClass}
                    value={getCatSlug(draft.category)}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.slug === e.target.value);
                      if (cat) setDraft({ ...draft, category: cat.name });
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-cream/60">Price ($)</label>
                  <input
                    className={adminInputClass}
                    value={draft.price ?? ""}
                    onChange={(e) => {
                      const t = e.target.value.trim();
                      setDraft({ ...draft, price: t === "" ? null : Number(t.replace(/[$,]/g, "")) });
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-cream/60">Order</label>
                  <input
                    type="number"
                    className={adminInputClass}
                    value={draft.sortOrder}
                    onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-cream/60">Description</label>
                  <textarea
                    className={`${adminInputClass} min-h-[80px]`}
                    value={draft.description ?? ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </div>
              </div>

              <ImageAttachField
                label="Photo"
                value={draft.imageUrl ?? ""}
                alt={draft.imageAlt ?? ""}
                onChange={(url) => setDraft({ ...draft, imageUrl: url || undefined })}
                onAltChange={(alt) => setDraft({ ...draft, imageAlt: alt })}
              />

              <div className="flex flex-wrap gap-4 text-sm text-cream/80">
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
                    onChange={(e) => setDraft({ ...draft, meatChoiceRequired: e.target.checked })}
                  />
                  Meat choice
                </label>
              </div>

              {draft.meatChoiceRequired && meats.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-cream/60">Meat prices</h4>
                  <div className="space-y-2">
                    {meatPrices.map((row, idx) => {
                      const meat = meats.find((m) => m.slug === row.meatSlug);
                      return (
                        <div key={row.meatSlug} className="flex items-center gap-3">
                          <span className="min-w-[100px] text-sm text-cream/70">{meat?.name ?? row.meatSlug}</span>
                          <input
                            className="w-24 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-sm text-cream"
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
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => void saveItem()}
                className="flex items-center gap-2 rounded-full bg-angie-orange px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                {busy ? "..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-cream/40">
              <Pencil className="mr-2 h-5 w-5" />
              <span>Select item to edit</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
