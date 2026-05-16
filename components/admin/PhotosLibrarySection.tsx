"use client";

import { useCallback, useEffect, useState } from "react";
import { MENU_CATEGORY_ORDER } from "@/lib/menu/schema";
import type { PhotoRecord } from "@/lib/photos/types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-form-styles";

function absolutePublicUrl(url: string): string {
  if (typeof window === "undefined") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

export function PhotosLibrarySection() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPhotos = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/admin/photos", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean; photos?: PhotoRecord[]; error?: string };
    if (!res.ok) {
      setLoadError(data.error ?? `Error ${res.status}`);
      return;
    }
    setPhotos(data.photos ?? []);
  }, []);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setBanner("Choose an image file.");
      return;
    }
    setBusy(true);
    setBanner(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("alt_text", uploadAlt);
      fd.set("category", uploadCategory);
      const res = await fetch("/api/admin/photos", { method: "POST", credentials: "include", body: fd });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setBanner(data.error ?? "Upload failed");
        return;
      }
      setFile(null);
      setUploadAlt("");
      setUploadCategory("");
      await loadPhotos();
      setBanner("Uploaded.");
    } finally {
      setBusy(false);
    }
  }

  async function saveMeta(id: string, alt_text: string, category: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/photos/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text, category }),
      });
      const data = (await res.json()) as { ok?: boolean; photo?: PhotoRecord; error?: string };
      if (!res.ok) {
        setBanner(data.error ?? "Save failed");
        return;
      }
      if (data.photo) setPhotos((prev) => prev.map((p) => (p.id === id ? data.photo! : p)));
      setBanner("Saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {banner ? (
        <p className="mb-4 rounded-xl border border-angie-orange/40 bg-angie-orange/10 px-4 py-2 text-sm text-cream">
          {banner}
        </p>
      ) : null}
      {loadError ? <p className="text-sm text-salsa">{loadError}</p> : null}
      <form onSubmit={(e) => void handleUpload(e)} className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <label className={adminLabelClass}>
          Image file
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm file:rounded-full file:border-0 file:bg-angie-orange file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream"
          />
        </label>
        <label className={adminLabelClass}>
          Alt text
          <input className={adminInputClass} value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} />
        </label>
        <label className={adminLabelClass}>
          Category
          <input
            className={adminInputClass}
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            list="photo-categories-lib"
          />
          <datalist id="photo-categories-lib">
            {MENU_CATEGORY_ORDER.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <button
          type="submit"
          disabled={busy || !file}
          className="rounded-full bg-angie-orange px-6 py-2 text-xs font-semibold uppercase tracking-editorial text-cream disabled:opacity-40"
        >
          Upload
        </button>
      </form>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => (
          <PhotoRow key={p.id} photo={p} disabled={busy} onSave={saveMeta} />
        ))}
      </div>
    </>
  );
}

function PhotoRow({
  photo,
  disabled,
  onSave,
}: {
  photo: PhotoRecord;
  disabled: boolean;
  onSave: (id: string, alt: string, category: string) => void;
}) {
  const [alt, setAlt] = useState(photo.alt_text);
  const [category, setCategory] = useState(photo.category);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="relative aspect-[4/3] bg-black/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="space-y-2 p-3">
        <input
          className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-sm text-cream"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt text"
        />
        <input
          className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-sm text-cream"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSave(photo.id, alt, category)}
          className="rounded-full bg-angie-orange px-3 py-1 text-[10px] uppercase text-cream"
        >
          Save
        </button>
        <p className="break-all text-[10px] text-cream/45">{absolutePublicUrl(photo.url)}</p>
      </div>
    </article>
  );
}
