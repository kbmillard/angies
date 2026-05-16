"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";
import { ImageAttachField } from "@/components/admin/ImageAttachField";
import {
  adminInputClass as inputClass,
  adminLabelClass as labelClass,
  adminSectionClass,
} from "@/components/admin/admin-form-styles";

export function SiteSettingsTab() {
  const [settings, setSettings] = useState<SiteSettingsResolved | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/admin/site-settings", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean; merged?: SiteSettingsResolved; error?: string };
    if (!res.ok) {
      setLoadError(data.error ?? `Error ${res.status}`);
      return;
    }
    if (data.merged) setSettings(data.merged);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!settings) return;
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { ok?: boolean; settings?: SiteSettingsResolved; error?: string };
      if (!res.ok) {
        setBanner(data.error ?? "Save failed");
        return;
      }
      if (data.settings) setSettings(data.settings);
      setBanner("Saved. Homepage updates after revalidation (refresh the home page).");
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <p className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-salsa" role="alert">
        {loadError}
      </p>
    );
  }

  if (!settings) {
    return <p className="mt-6 text-sm text-cream/60">Loading homepage content…</p>;
  }

  return (
    <div className="mt-8 space-y-10">
      {banner ? (
        <p className="rounded-xl border border-angie-orange/40 bg-angie-orange/10 px-4 py-2 text-sm text-cream">
          {banner}
        </p>
      ) : null}

      <section id="hero" className={adminSectionClass}>
        <h2 className="font-display text-xl text-cream">Hero</h2>
        <p className="mt-1 text-sm text-cream/55">Upload or pick images for the homepage slideshow.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Eyebrow
            <input
              className={inputClass}
              value={settings.hero.eyebrow}
              onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, eyebrow: e.target.value } })}
            />
          </label>
          <label className={labelClass}>
            Headline line 1
            <input
              className={inputClass}
              value={settings.hero.headlineLine1}
              onChange={(e) =>
                setSettings({ ...settings, hero: { ...settings.hero, headlineLine1: e.target.value } })
              }
            />
          </label>
          <label className={labelClass}>
            Headline line 2
            <input
              className={inputClass}
              value={settings.hero.headlineLine2}
              onChange={(e) =>
                setSettings({ ...settings, hero: { ...settings.hero, headlineLine2: e.target.value } })
              }
            />
          </label>
          <label className={`sm:col-span-2 ${labelClass}`}>
            Body
            <textarea
              className={`${inputClass} min-h-[88px]`}
              value={settings.hero.body}
              onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, body: e.target.value } })}
            />
          </label>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-editorial text-cream/70">Hero CTAs</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["order", "Order"],
              ["viewMenu", "View menu"],
              ["findTruck", "Find the truck"],
              ["schedule", "Schedule"],
              ["catering", "Catering"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={labelClass}>
              {label}
              <input
                className={inputClass}
                value={settings.hero.cta[key]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, cta: { ...settings.hero.cta, [key]: e.target.value } },
                  })
                }
              />
            </label>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-editorial text-cream/70">Hero slideshow</h3>
        <div className="mt-4 space-y-4">
          {settings.hero.slides.map((s, idx) => (
            <div
              key={`hero-${idx}`}
              className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <ImageAttachField
                label={`Slide ${idx + 1}`}
                value={s.src}
                alt={s.alt}
                onChange={(src) => {
                  const slides = [...settings.hero.slides];
                  slides[idx] = { ...slides[idx]!, src };
                  setSettings({ ...settings, hero: { ...settings.hero, slides } });
                }}
                onAltChange={(alt) => {
                  const slides = [...settings.hero.slides];
                  slides[idx] = { ...slides[idx]!, alt };
                  setSettings({ ...settings, hero: { ...settings.hero, slides } });
                }}
              />
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
                onClick={() => {
                  const slides = settings.hero.slides.filter((_, i) => i !== idx);
                  setSettings({ ...settings, hero: { ...settings.hero, slides } });
                }}
              >
                Remove slide
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
            onClick={() =>
              setSettings({
                ...settings,
                hero: {
                  ...settings.hero,
                  slides: [...settings.hero.slides, { src: "/gallery/truck.png", alt: "" }],
                },
              })
            }
          >
            Add hero slide
          </button>
        </div>
      </section>

      <section id="prologue" className={adminSectionClass}>
        <h2 className="font-display text-xl text-cream">Prologue</h2>
        <div className="mt-6 space-y-4">
          <label className={labelClass}>
            Title
            <input
              className={inputClass}
              value={settings.prologue.title}
              onChange={(e) =>
                setSettings({ ...settings, prologue: { ...settings.prologue, title: e.target.value } })
              }
            />
          </label>
          <label className={labelClass}>
            Subtitle
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={settings.prologue.subtitle}
              onChange={(e) =>
                setSettings({ ...settings, prologue: { ...settings.prologue, subtitle: e.target.value } })
              }
            />
          </label>
        </div>
      </section>

      <section id="story" className={adminSectionClass}>
        <h2 className="font-display text-xl text-cream">Story</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Section kicker
            <input
              className={inputClass}
              value={settings.story.sectionKicker}
              onChange={(e) =>
                setSettings({ ...settings, story: { ...settings.story, sectionKicker: e.target.value } })
              }
            />
          </label>
          <label className={labelClass}>
            Section title
            <input
              className={inputClass}
              value={settings.story.sectionTitle}
              onChange={(e) =>
                setSettings({ ...settings, story: { ...settings.story, sectionTitle: e.target.value } })
              }
            />
          </label>
          <label className={`sm:col-span-2 ${labelClass}`}>
            Quote 1
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={settings.story.quote1}
              onChange={(e) => setSettings({ ...settings, story: { ...settings.story, quote1: e.target.value } })}
            />
          </label>
          <label className={`sm:col-span-2 ${labelClass}`}>
            Quote 2
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={settings.story.quote2}
              onChange={(e) => setSettings({ ...settings, story: { ...settings.story, quote2: e.target.value } })}
            />
          </label>
          <label className={`sm:col-span-2 ${labelClass}`}>
            Quote footer
            <input
              className={inputClass}
              value={settings.story.quoteFooter}
              onChange={(e) =>
                setSettings({ ...settings, story: { ...settings.story, quoteFooter: e.target.value } })
              }
            />
          </label>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-editorial text-cream/70">Story carousel</h3>
        <div className="mt-4 space-y-4">
          {settings.story.slides.map((s, idx) => (
            <div key={`story-${idx}`} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <ImageAttachField
                label={`Story slide ${idx + 1}`}
                value={s.src}
                alt={s.alt}
                onChange={(src) => {
                  const slides = [...settings.story.slides];
                  slides[idx] = { ...slides[idx]!, src };
                  setSettings({ ...settings, story: { ...settings.story, slides } });
                }}
                onAltChange={(alt) => {
                  const slides = [...settings.story.slides];
                  slides[idx] = { ...slides[idx]!, alt };
                  setSettings({ ...settings, story: { ...settings.story, slides } });
                }}
              />
              <label className={labelClass}>
                Overlay kicker
                <input
                  className={inputClass}
                  value={s.kicker}
                  onChange={(e) => {
                    const slides = [...settings.story.slides];
                    slides[idx] = { ...slides[idx]!, kicker: e.target.value };
                    setSettings({ ...settings, story: { ...settings.story, slides } });
                  }}
                />
              </label>
              <label className={labelClass}>
                Overlay line
                <input
                  className={inputClass}
                  value={s.line}
                  onChange={(e) => {
                    const slides = [...settings.story.slides];
                    slides[idx] = { ...slides[idx]!, line: e.target.value };
                    setSettings({ ...settings, story: { ...settings.story, slides } });
                  }}
                />
              </label>
              <button
                type="button"
                className="self-start rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
                onClick={() => {
                  const slides = settings.story.slides.filter((_, i) => i !== idx);
                  setSettings({ ...settings, story: { ...settings.story, slides } });
                }}
              >
                Remove slide
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
            onClick={() =>
              setSettings({
                ...settings,
                story: {
                  ...settings.story,
                  slides: [
                    ...settings.story.slides,
                    { src: "/gallery/truck1.jpg", alt: "", kicker: "", line: "" },
                  ],
                },
              })
            }
          >
            Add story slide
          </button>
        </div>
      </section>

      <section id="social" className={adminSectionClass}>
        <h2 className="font-display text-xl text-cream">Social</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(["kicker", "title", "subtitle", "body"] as const).map((key) => (
            <label key={key} className={key === "body" || key === "subtitle" ? `sm:col-span-2 ${labelClass}` : labelClass}>
              {key}
              {key === "body" || key === "subtitle" ? (
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={settings.social[key] ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      social: { ...settings.social, [key]: e.target.value },
                    })
                  }
                />
              ) : (
                <input
                  className={inputClass}
                  value={settings.social[key]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      social: { ...settings.social, [key]: e.target.value },
                    })
                  }
                />
              )}
            </label>
          ))}
          <label className={labelClass}>
            Instagram handle
            <input
              className={inputClass}
              value={settings.social.instagramHandle ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, instagramHandle: e.target.value },
                })
              }
            />
          </label>
          <label className={labelClass}>
            Facebook label
            <input
              className={inputClass}
              value={settings.social.facebookHandle ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, facebookHandle: e.target.value },
                })
              }
            />
          </label>
        </div>
      </section>

      <section id="catering" className={adminSectionClass}>
        <h2 className="font-display text-xl text-cream">Catering</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(["kicker", "title", "subtitle", "body"] as const).map((key) => (
            <label key={key} className={key === "body" || key === "subtitle" ? `sm:col-span-2 ${labelClass}` : labelClass}>
              {key}
              {key === "body" || key === "subtitle" ? (
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={settings.catering[key] ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      catering: { ...settings.catering, [key]: e.target.value },
                    })
                  }
                />
              ) : (
                <input
                  className={inputClass}
                  value={settings.catering[key]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      catering: { ...settings.catering, [key]: e.target.value },
                    })
                  }
                />
              )}
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-full bg-angie-orange px-6 py-3 text-sm font-semibold uppercase tracking-editorial text-cream shadow-sm transition hover:bg-angie-orange/90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save site content"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void load()}
          className="rounded-full border border-white/20 px-6 py-3 text-sm text-cream/85 hover:bg-white/5 disabled:opacity-50"
        >
          Reload from server
        </button>
      </div>
    </div>
  );
}
