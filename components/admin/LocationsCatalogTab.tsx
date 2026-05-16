"use client";

import { useCallback, useEffect, useState } from "react";
import type { LocationItem, LocationType } from "@/lib/locations/schema";

function emptyLoc(): LocationItem {
  return {
    id: "",
    active: true,
    type: "food_truck",
    sortOrder: 0,
    name: "",
    label: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    hours: "",
    phone: "",
    email: "",
    status: "",
    statusNote: "",
    mapsUrl: "",
    embedUrl: "",
    lat: null,
    lng: null,
    lastUpdated: "",
  };
}

export function LocationsCatalogTab() {
  const [items, setItems] = useState<LocationItem[]>([]);
  const [draft, setDraft] = useState<LocationItem>(emptyLoc);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setMsg(null);
    const r = await fetch("/api/admin/locations", { credentials: "include" });
    const d = (await r.json()) as { ok?: boolean; items?: LocationItem[]; error?: string };
    if (!r.ok) {
      setMsg(d.error ?? `Error ${r.status}`);
      return;
    }
    setItems(d.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setMsg(null);
    const isNew = !draft.id.trim();
    setBusy(true);
    try {
      const body = isNew ? { ...draft, id: "" } : draft;
      const r = isNew
        ? await fetch("/api/admin/locations", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/admin/locations/${encodeURIComponent(draft.id)}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
      const d = (await r.json()) as { ok?: boolean; item?: LocationItem; error?: string };
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
    if (!draft.id.trim() || !confirm(`Delete “${draft.name}”?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/admin/locations/${encodeURIComponent(draft.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok) {
        setMsg(d.error ?? "Delete failed");
        return;
      }
      setDraft(emptyLoc());
      await load();
      setMsg("Deleted.");
    } finally {
      setBusy(false);
    }
  }

  const field = (
    label: string,
    key: keyof LocationItem,
    type: "text" | "number" = "text",
  ) => (
    <label key={String(key)} className="block text-xs">
      <span className="text-cream/60">{label}</span>
      <input
        type={type}
        value={
          draft[key] === null || draft[key] === undefined
            ? ""
            : String(draft[key] as string | number)
        }
        onChange={(e) => {
          const v = e.target.value;
          setDraft((prev) => {
            if (type === "number") {
              if (v === "") return { ...prev, [key]: null };
              const n = Number(v);
              return { ...prev, [key]: Number.isFinite(n) ? n : prev[key] };
            }
            return { ...prev, [key]: v };
          });
        }}
        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
      />
    </label>
  );

  return (
    <div className="space-y-6">
      {msg ? (
        <p className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-cream/85">
          {msg}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setDraft(emptyLoc());
            setMsg(null);
          }}
          className="rounded-full border border-angie-orange/50 px-4 py-2 text-xs uppercase text-angie-orange"
        >
          New location
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <h3 className="text-sm text-cream/80">Locations ({items.length})</h3>
          <ul className="mt-2 max-h-[48vh] space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...it });
                    setMsg(null);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    draft.id === it.id
                      ? "bg-angie-orange/25 text-cream"
                      : "text-cream/75 hover:bg-white/5"
                  }`}
                >
                  <span className="block truncate font-medium">{it.name}</span>
                  <span className="block truncate text-xs text-cream/50">{it.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-charcoal/40 p-4">
          <label className="block text-xs">
            <span className="text-cream/60">id (blank = new)</span>
            <input
              value={draft.id}
              onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 font-mono text-sm text-cream"
            />
          </label>
          <label className="block text-xs">
            <span className="text-cream/60">type</span>
            <select
              value={draft.type}
              onChange={(e) =>
                setDraft((d) => ({ ...d, type: e.target.value as LocationType }))
              }
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
            >
              <option value="food_truck">food_truck</option>
              <option value="restaurant">restaurant</option>
            </select>
          </label>
          {field("name", "name")}
          {field("sort order", "sortOrder", "number")}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
            />
            active
          </label>
          {field("label", "label")}
          {field("address", "address")}
          {field("city", "city")}
          {field("state", "state")}
          {field("zip", "zip")}
          {field("hours", "hours")}
          {field("phone", "phone")}
          {field("email", "email")}
          {field("status", "status")}
          {field("status note", "statusNote")}
          {field("mapsUrl", "mapsUrl")}
          {field("embedUrl", "embedUrl")}
          {field("lat", "lat", "number")}
          {field("lng", "lng", "number")}
          {field("lastUpdated", "lastUpdated")}
          {field("timezone", "timezone")}
          <label className="block text-xs">
            <span className="text-cream/60">weeklyHoursJson</span>
            <textarea
              value={draft.weeklyHoursJson ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  weeklyHoursJson: e.target.value.trim() || undefined,
                }))
              }
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 font-mono text-xs text-cream"
            />
          </label>
          <label className="block text-xs">
            <span className="text-cream/60">messageBoard</span>
            <textarea
              value={draft.messageBoard ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  messageBoard: e.target.value.trim() || undefined,
                }))
              }
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
            />
          </label>
          {field("placeId", "placeId")}
          {field("formattedAddress", "formattedAddress")}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-full bg-angie-orange px-5 py-2 text-xs font-semibold uppercase text-cream"
            >
              Save
            </button>
            <button
              type="button"
              disabled={busy || !draft.id.trim()}
              onClick={() => void remove()}
              className="rounded-full border border-salsa/50 px-5 py-2 text-xs uppercase text-salsa"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
