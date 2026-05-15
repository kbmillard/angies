"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { PhotoRecord } from "@/lib/photos/types";
import type { PhotosAdminStatus } from "@/lib/photos/admin-status";
import { MENU_CATEGORY_ORDER } from "@/lib/menu/schema";

function absolutePublicUrl(url: string): string {
  if (typeof window === "undefined") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

type Props = {
  initialAuthed: boolean;
  status: PhotosAdminStatus;
};

export function PhotosAdminClient({ initialAuthed, status }: Props) {
  const router = useRouter();
  const [authed, setAuthed] = useState(initialAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");

  useEffect(() => {
    setAuthed(initialAuthed);
  }, [initialAuthed]);

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
    if (authed) void loadPhotos();
  }, [authed, loadPhotos]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setLoginError(data.error ?? "Login failed");
        return;
      }
      setPassword("");
      setAuthed(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
    setPhotos([]);
    router.refresh();
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setBanner("Choose an image file.");
      return;
    }
    setBanner(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("alt_text", uploadAlt);
      fd.set("category", uploadCategory);
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
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
    setBanner(null);
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
      if (data.photo) {
        setPhotos((prev) => prev.map((p) => (p.id === id ? data.photo! : p)));
      }
      setBanner("Saved.");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(url: string) {
    const full = absolutePublicUrl(url);
    try {
      await navigator.clipboard.writeText(full);
      setBanner(`Copied: ${full}`);
    } catch {
      setBanner("Could not copy — select the URL manually.");
    }
  }

  if (!status.passwordConfigured) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-display text-2xl text-cream">Admin</h1>
        <p className="mt-4 text-sm text-cream/70">
          Photo admin is not enabled on this deployment. Set{" "}
          <code className="rounded bg-white/10 px-1 text-xs">ADMIN_PHOTOS_PASSWORD</code>{" "}
          (and optionally{" "}
          <code className="rounded bg-white/10 px-1 text-xs">BLOB_READ_WRITE_TOKEN</code> and{" "}
          <code className="rounded bg-white/10 px-1 text-xs">DATABASE_URL</code>) in the Vercel
          project environment, then redeploy.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/" className="text-angie-orange underline-offset-4 hover:underline">
            ← Back to site
          </Link>
        </p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-5 py-16">
        <p className="text-xs uppercase tracking-editorial text-cream/50">angieskc.com</p>
        <h1 className="mt-1 font-display text-2xl text-cream">Admin sign-in</h1>
        <p className="mt-2 text-sm text-cream/65">Photo library (not indexed for search).</p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-cream/90">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-cream outline-none focus-visible:ring-2 focus-visible:ring-angie-orange/60"
            />
          </label>
          {loginError ? (
            <p className="text-sm text-salsa" role="alert">
              {loginError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-angie-orange py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-sm transition hover:bg-angie-orange/90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-angie-orange underline-offset-4 hover:underline">
            ← Back to site
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs uppercase tracking-editorial text-cream/50">angieskc.com · admin</p>
          <h1 className="mt-1 font-display text-3xl text-cream">Photo library</h1>
          <p className="mt-2 max-w-xl text-sm text-cream/65">
            Upload images for menu URLs. Copy the public link into your Google Sheet{" "}
            <code className="rounded bg-white/10 px-1 text-xs">imageUrl</code> column.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-editorial text-cream/80 hover:bg-white/5"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-editorial text-cream/80 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-cream/70">
        <p>
          <span className="text-cream/90">Metadata:</span>{" "}
          {status.metadataMode === "postgres" ? "PostgreSQL" : "Local JSON (.data/photos.json)"}
          {status.metadataMode === "local-json"
            ? " — set DATABASE_URL on Vercel for durable storage."
            : null}
        </p>
        <p>
          <span className="text-cream/90">File storage:</span>{" "}
          {status.blobConfigured
            ? "Vercel Blob"
            : status.devLocalUpload
              ? "Local public/gallery/uploads (dev only)"
              : "Not configured — set BLOB_READ_WRITE_TOKEN on Vercel to enable uploads in production."}
        </p>
      </div>

      {banner ? (
        <p className="mt-4 rounded-xl border border-angie-orange/40 bg-angie-orange/10 px-4 py-2 text-sm text-cream">
          {banner}
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-4 text-sm text-salsa" role="alert">
          {loadError}
        </p>
      ) : null}

      <section className="mt-10 rounded-2xl border border-white/10 bg-charcoal/50 p-6 backdrop-blur-sm">
        <h2 className="font-display text-xl text-cream">Upload</h2>
        <p className="mt-1 text-sm text-cream/60">JPEG, PNG, WebP, or GIF — max ~12 MB.</p>
        <form onSubmit={(e) => void handleUpload(e)} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-cream/80">Image file</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-cream/80 file:mr-4 file:rounded-full file:border-0 file:bg-angie-orange file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-cream"
            />
          </label>
          <label className="block text-sm">
            <span className="text-cream/80">Alt text</span>
            <input
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-cream"
              placeholder="Describe the dish for accessibility"
            />
          </label>
          <label className="block text-sm">
            <span className="text-cream/80">Category</span>
            <input
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              list="photo-categories"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-cream"
              placeholder="e.g. Tacos, Burritos"
            />
            <datalist id="photo-categories">
              {MENU_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <button
            type="submit"
            disabled={busy || !file}
            className="rounded-full bg-angie-orange px-6 py-2 text-xs font-semibold uppercase tracking-editorial text-cream hover:bg-angie-orange/90 disabled:opacity-40"
          >
            {busy ? "Uploading…" : "Upload photo"}
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-cream">Library ({photos.length})</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <PhotoAdminRow key={p.id} photo={p} disabled={busy} onSave={saveMeta} onCopy={copyUrl} />
          ))}
        </div>
        {photos.length === 0 ? (
          <p className="mt-6 text-sm text-cream/50">No uploads yet.</p>
        ) : null}
      </section>
    </main>
  );
}

function PhotoAdminRow({
  photo,
  disabled,
  onSave,
  onCopy,
}: {
  photo: PhotoRecord;
  disabled: boolean;
  onSave: (id: string, alt: string, category: string) => void;
  onCopy: (url: string) => void;
}) {
  const [alt, setAlt] = useState(photo.alt_text);
  const [category, setCategory] = useState(photo.category);

  useEffect(() => {
    setAlt(photo.alt_text);
    setCategory(photo.category);
  }, [photo.alt_text, photo.category, photo.id]);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="relative aspect-[4/3] bg-black/50">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; URLs may be blob or local */}
        <img
          src={photo.url}
          alt={alt || photo.filename}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="space-y-3 p-4">
        <p className="truncate text-xs text-cream/50" title={photo.filename}>
          <span className="text-cream/75">File:</span> {photo.filename}
        </p>
        <label className="block text-xs">
          <span className="text-cream/65">Alt text</span>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
          />
        </label>
        <label className="block text-xs">
          <span className="text-cream/65">Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list={`photo-cat-${photo.id}`}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-cream"
          />
          <datalist id={`photo-cat-${photo.id}`}>
            {MENU_CATEGORY_ORDER.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSave(photo.id, alt, category)}
            className="rounded-full bg-angie-orange px-3 py-1.5 text-[10px] font-semibold uppercase tracking-editorial text-cream disabled:opacity-40"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onCopy(photo.url)}
            className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-editorial text-cream/85 hover:bg-white/5"
          >
            Copy public URL
          </button>
        </div>
        <p className="break-all text-[10px] text-cream/45">{absolutePublicUrl(photo.url)}</p>
      </div>
    </article>
  );
}
