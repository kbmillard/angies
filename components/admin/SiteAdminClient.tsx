"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteSettingsTab } from "@/components/admin/SiteSettingsTab";
import { MenuSectionEditor } from "@/components/admin/MenuSectionEditor";
import { ModifiersSectionEditor } from "@/components/admin/ModifiersSectionEditor";
import { LocationsCatalogTab } from "@/components/admin/LocationsCatalogTab";
import { ScheduleCatalogTab } from "@/components/admin/ScheduleCatalogTab";
import { PhotosLibrarySection } from "@/components/admin/PhotosLibrarySection";
import { adminSectionClass } from "@/components/admin/admin-form-styles";
import type { PhotosAdminStatus } from "@/lib/photos/admin-status";

const NAV: { id: string; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "prologue", label: "Prologue" },
  { id: "story", label: "Story" },
  { id: "menu", label: "Menu" },
  { id: "modifiers", label: "Modifiers" },
  { id: "locations", label: "Locations" },
  { id: "schedule", label: "Schedule" },
  { id: "social", label: "Social" },
  { id: "catering", label: "Catering" },
  { id: "photos", label: "Photos" },
];

const TAB_TO_HASH: Record<string, string> = {
  site: "hero",
  photos: "photos",
  menu: "menu",
  locations: "locations",
  schedule: "schedule",
};

type Props = {
  initialAuthed: boolean;
  status: PhotosAdminStatus;
  initialTab?: string;
};

export function SiteAdminClient({ initialAuthed, status, initialTab }: Props) {
  const router = useRouter();
  const [authed, setAuthed] = useState(initialAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAuthed(initialAuthed);
  }, [initialAuthed]);

  useEffect(() => {
    if (!initialTab) return;
    const hash = TAB_TO_HASH[initialTab];
    if (hash) {
      window.location.hash = hash;
    }
  }, [initialTab]);

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
    router.refresh();
  }

  if (!status.passwordConfigured) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-display text-2xl text-cream">Admin</h1>
        <p className="mt-4 text-sm text-cream/70">
          Set <code className="rounded bg-white/10 px-1">ADMIN_PHOTOS_PASSWORD</code> on the server.
        </p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-2xl text-cream">Admin sign-in</h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <label className="block text-sm text-cream/90">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-cream"
            />
          </label>
          {loginError ? <p className="text-sm text-salsa">{loginError}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-angie-orange py-3 text-sm font-semibold uppercase tracking-editorial text-cream"
          >
            Sign in
          </button>
        </form>
        <Link href="/" className="mt-8 inline-block text-sm text-angie-orange hover:underline">
          ← Back to site
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs uppercase tracking-editorial text-cream/50">angieskc.com · admin</p>
          <h1 className="mt-1 font-display text-3xl text-cream">Edit site</h1>
          <p className="mt-2 max-w-xl text-sm text-cream/65">
            One page — same order as the public homepage. Changes save to Postgres and appear on the live site.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
          <span className="text-cream/90">Database:</span>{" "}
          {status.metadataMode === "postgres" ? "PostgreSQL ✓" : "Missing DATABASE_URL"}
        </p>
        <p>
          <span className="text-cream/90">Uploads:</span>{" "}
          {status.blobConfigured
            ? "Vercel Blob ✓"
            : status.devLocalUpload
              ? "Local dev uploads"
              : "Set BLOB_READ_WRITE_TOKEN"}
        </p>
        <p>
          <span className="text-cream/90">Live menu:</span>{" "}
          {status.siteCatalogFromDatabase ? "database ✓" : "Set SITE_DATA_SOURCE=database"}
        </p>
      </div>

      <nav className="sticky top-[var(--nav-h,64px)] z-20 -mx-5 mt-8 flex gap-2 overflow-x-auto border-b border-white/10 bg-charcoal/95 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        {NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-editorial text-cream/80 hover:bg-white/10"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-12 pb-24">
        <SiteSettingsTab />

        <MenuSectionEditor />
        <ModifiersSectionEditor />

        <section id="locations" className={adminSectionClass}>
          <h2 className="mb-6 font-display text-2xl text-cream">Locations</h2>
          <LocationsCatalogTab />
        </section>

        <section id="schedule" className={adminSectionClass}>
          <h2 className="mb-6 font-display text-2xl text-cream">Schedule</h2>
          <ScheduleCatalogTab />
        </section>

        <section id="photos" className={adminSectionClass}>
          <h2 className="mb-2 font-display text-2xl text-cream">Photo library</h2>
          <p className="mb-6 text-sm text-cream/60">Upload images used across hero, menu, and gallery.</p>
          <PhotosLibrarySection />
        </section>
      </div>
    </main>
  );
}
