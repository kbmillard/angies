"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/menu/schema";
import { MENU_CATEGORY_ORDER } from "@/lib/menu/schema";

function emptyDraft(): MenuItem {
  return {
    id: "",
    active: true,
    category: "Tacos",
    sortOrder: 0,
    name: "",
    description: "",
    price: null,
    includesFries: false,
    meatChoiceRequired: false,
    featured: false,
  };
}

export function MenuCatalogTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [relationalSource, setRelationalSource] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<MenuItem>(emptyDraft);
  const [optJson, setOptJson] = useState("[]");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setMsg(null);
    const r = await fetch("/api/admin/menu", { credentials: "include" });
    const d = (await r.json()) as {
      ok?: boolean;
      items?: MenuItem[];
      catalogSource?: "relational" | "legacy";
      error?: string;
    };
    if (!r.ok) {
      setMsg(d.error ?? `Error ${r.status}`);
      return;
    }
    setRelationalSource(d.catalogSource === "relational");
    setItems(d.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      const d = (await r.json()) as {
        ok?: boolean;
        error?: string;
        categories?: number;
        items?: number;
        modifiers?: number;
        meatPriceOverrides?: number;
        warnings?: string[];
      };
      if (!r.ok) {
        setMsg(d.error ?? "Import failed");
        return;
      }
      const w = (d.warnings ?? []).join(" ");
      setMsg(
        `Imported: ${d.categories ?? 0} categories, ${d.items ?? 0} items, ${d.modifiers ?? 0} modifiers, ${d.meatPriceOverrides ?? 0} meat price overrides.${w ? ` Warnings: ${w}` : ""}`,
      );
      setImportFile(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/seed-catalog", {
        method: "POST",
        credentials: "include",
      });
      const d = (await r.json()) as { ok?: boolean; seeded?: string[]; error?: string };
      if (!r.ok) {
        setMsg(d.error ?? "Seed failed");
        return;
      }
      setMsg(`Seeded: ${(d.seeded ?? []).join(", ") || "nothing (tables not empty)"}`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setMsg(null);
    let optionGroups: MenuItem["optionGroups"];
    try {
      const parsed = JSON.parse(optJson || "null");
      if (parsed === null) optionGroups = undefined;
      else if (Array.isArray(parsed)) optionGroups = parsed as MenuItem["optionGroups"];
      else throw new Error("optionGroups JSON must be an array or null");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Invalid optionGroups JSON");
      return;
    }

    const item: MenuItem = { ...draft, optionGroups };
    const isNew = !item.id.trim();
    setBusy(true);
    try {
      const r = isNew
        ? await fetch("/api/admin/menu", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, id: "" }),
          })
        : await fetch(`/api/admin/menu/${encodeURIComponent(item.id)}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
      const d = (await r.json()) as { ok?: boolean; item?: MenuItem; error?: string };
      if (!r.ok) {
        setMsg(d.error ?? "Save failed");
        return;
      }
      setMsg("Saved.");
      if (d.item) setDraft(d.item);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft.id.trim()) return;
    if (!confirm(`Delete “${draft.name}”?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/admin/menu/${encodeURIComponent(draft.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok) {
        setMsg(d.error ?? "Delete failed");
        return;
      }
      setDraft(emptyDraft());
      await load();
      setMsg("Deleted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || relationalSource}
          onClick={() => void seed()}
          className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/90 hover:bg-white/5 disabled:opacity-40"
          title={
            relationalSource
              ? "Built-in seed skips menu when relational catalog is active."
              : undefined
          }
        >
          Seed from built-in (empty DB only)
        </button>
        {!relationalSource ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setDraft(emptyDraft());
              setOptJson("[]");
              setMsg(null);
            }}
            className="rounded-full border border-angie-orange/50 px-4 py-2 text-xs uppercase tracking-editorial text-angie-orange hover:bg-angie-orange/10 disabled:opacity-40"
          >
            New item
          </button>
        ) : null}
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <h3 className="font-display text-lg text-cream">Import menu JSON</h3>
        <p className="mt-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-xs leading-relaxed text-cream/85">
          <span className="font-semibold text-cream">Live angieskc.com menu</span> only updates after you
          run <span className="font-semibold text-cream">Import JSON</span> here (or change rows in the
          editor below). A file on your laptop is not connected until imported. For category hero
          photos, set each item&apos;s <span className="font-semibold text-cream">image URL</span> in
          admin to a path like <code className="text-cream/90">/gallery/…</code> or paste the public URL
          from the Photos tab after upload.
        </p>
        <p className="mt-2 text-xs text-cream/65">
          Replaces the relational menu in Postgres (categories, items, modifiers, meat price
          overrides). Requires admin session and <code className="text-cream/90">DATABASE_URL</code>
          . Set <code className="text-cream/90">SITE_DATA_SOURCE=database</code> so the public site
          reads from the database.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="text-sm text-cream/80 file:mr-3 file:rounded-full file:border-0 file:bg-angie-orange file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-cream"
          />
          <button
            type="button"
            disabled={busy || !importFile}
            onClick={() => void importJson()}
            className="rounded-full bg-angie-orange px-5 py-2 text-xs font-semibold uppercase tracking-editorial text-cream disabled:opacity-40"
          >
            Import JSON
          </button>
        </div>
        {relationalSource ? (
          <p className="mt-3 text-xs text-angie-orange/90">
            Relational catalog is active — the form below is read-only. Use a new JSON import to
            change prices or items.
          </p>
        ) : null}
      </section>

      {msg ? (
        <p className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-cream/85">{msg}</p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <h3 className="text-sm font-medium text-cream/80">Items ({items.length})</h3>
          <ul className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...it });
                    setOptJson(JSON.stringify(it.optionGroups ?? [], null, 2));
                    setMsg(null);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    draft.id === it.id
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

        <div className="space-y-4 rounded-2xl border border-white/10 bg-charcoal/40 p-5">
          <h3 className="font-display text-lg text-cream">
            Edit{relationalSource ? " (disabled)" : ""}
          </h3>
          {!relationalSource ? (
            <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs sm:col-span-2">
              <span className="text-cream/60">id (blank = new)</span>
              <input
                value={draft.id}
                onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 font-mono text-sm text-cream"
              />
            </label>
            <label className="block text-xs">
              <span className="text-cream/60">name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
              />
            </label>
            <label className="block text-xs">
              <span className="text-cream/60">category</span>
              <input
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                list="admin-menu-cats"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
              />
              <datalist id="admin-menu-cats">
                {MENU_CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="block text-xs">
              <span className="text-cream/60">sort order</span>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) || 0 }))
                }
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
              />
            </label>
            <label className="block text-xs">
              <span className="text-cream/60">price (USD)</span>
              <input
                value={draft.price ?? ""}
                onChange={(e) => {
                  const t = e.target.value.trim();
                  setDraft((d) => ({
                    ...d,
                    price: t === "" ? null : Number(t.replace(/[$,]/g, "")),
                  }));
                }}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
                placeholder="TBD"
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-cream/60">imageUrl</span>
              <input
                value={draft.imageUrl ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    imageUrl: e.target.value.trim() || undefined,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-cream/60">description</span>
              <textarea
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value || undefined }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              />
              active
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
              />
              featured
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={draft.includesFries}
                onChange={(e) => setDraft((d) => ({ ...d, includesFries: e.target.checked }))}
              />
              includesFries
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={draft.meatChoiceRequired}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, meatChoiceRequired: e.target.checked }))
                }
              />
              meatChoiceRequired
            </label>
          </div>
          <label className="block text-xs">
            <span className="text-cream/60">optionGroups (JSON array)</span>
            <textarea
              value={optJson}
              onChange={(e) => setOptJson(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 font-mono text-xs text-cream"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-full bg-angie-orange px-5 py-2 text-xs font-semibold uppercase tracking-editorial text-cream disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              disabled={busy || !draft.id.trim()}
              onClick={() => void remove()}
              className="rounded-full border border-salsa/50 px-5 py-2 text-xs uppercase tracking-editorial text-salsa disabled:opacity-40"
            >
              Delete
            </button>
          </div>
            </>
          ) : (
            <pre className="max-h-[55vh] overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-left text-xs leading-relaxed text-cream/85">
              {JSON.stringify(
                {
                  ...draft,
                  optionGroups: draft.optionGroups ?? (() => {
                    try {
                      return JSON.parse(optJson || "[]");
                    } catch {
                      return [];
                    }
                  })(),
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
