"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { PhotoRecord } from "@/lib/photos/types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-form-styles";

function absolutePublicUrl(url: string): string {
  if (typeof window === "undefined") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

export type ImageAttachFieldProps = {
  label?: string;
  value: string;
  alt?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
};

export function ImageAttachField({
  label = "Image",
  value,
  alt = "",
  onChange,
  onAltChange,
}: ImageAttachFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true);
    try {
      const res = await fetch("/api/admin/photos", { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; photos?: PhotoRecord[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load library");
        return;
      }
      setPhotos(data.photos ?? []);
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (libraryOpen && photos.length === 0) void loadLibrary();
  }, [libraryOpen, photos.length, loadLibrary]);

  async function uploadSelected() {
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("alt_text", alt);
      fd.set("category", "admin");
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json()) as { ok?: boolean; photo?: PhotoRecord; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      if (data.photo?.url) {
        onChange(data.photo.url);
        if (onAltChange && data.photo.alt_text) onAltChange(data.photo.alt_text);
      }
      setFile(null);
    } finally {
      setBusy(false);
    }
  }

  const previewSrc = value?.trim() ? absolutePublicUrl(value.trim()) : null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-editorial text-cream/65">{label}</p>
      {previewSrc ? (
        <div className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <Image src={previewSrc} alt={alt || label} fill className="object-cover" sizes="320px" unoptimized />
        </div>
      ) : (
        <div className="flex aspect-[4/3] max-w-xs items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 text-xs text-cream/45">
          No image
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream/85 hover:bg-white/5">
          Choose file
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
          />
        </label>
        <button
          type="button"
          disabled={busy || !file}
          onClick={() => void uploadSelected()}
          className="rounded-full bg-angie-orange px-3 py-1.5 text-[10px] font-semibold uppercase tracking-editorial text-cream disabled:opacity-40"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen((o) => !o)}
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream/85 hover:bg-white/5"
        >
          {libraryOpen ? "Hide library" : "From library"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream/55 hover:bg-white/5"
          >
            Clear
          </button>
        ) : null}
      </div>
      {onAltChange ? (
        <label className={adminLabelClass}>
          Alt text
          <input className={adminInputClass} value={alt} onChange={(e) => onAltChange(e.target.value)} />
        </label>
      ) : null}
      {error ? (
        <p className="text-xs text-salsa" role="alert">
          {error}
        </p>
      ) : null}
      {libraryOpen ? (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2">
          {libraryLoading ? (
            <p className="p-2 text-xs text-cream/50">Loading…</p>
          ) : photos.length === 0 ? (
            <p className="p-2 text-xs text-cream/50">No photos yet — upload on the Photos section.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10 hover:ring-2 hover:ring-angie-orange/50"
                    onClick={() => {
                      onChange(p.url);
                      if (onAltChange && p.alt_text) onAltChange(p.alt_text);
                      setLibraryOpen(false);
                    }}
                  >
                    <Image
                      src={absolutePublicUrl(p.url)}
                      alt={p.alt_text || "Photo"}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

