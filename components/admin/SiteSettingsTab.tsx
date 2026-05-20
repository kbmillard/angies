"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";
import { ImageAttachField } from "@/components/admin/ImageAttachField";
import {
  adminInputClass as inputClass,
  adminLabelClass as labelClass,
} from "@/components/admin/admin-form-styles";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";

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

      <CollapsibleSection id="hero" title="Hero" defaultOpen={false}>
        <p className="mb-4 text-sm text-cream/55">Upload or pick images for the homepage slideshow.</p>
        <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settings.hero.slides.map((s, idx) => (
            <div
              key={`hero-${idx}`}
              className="group relative rounded-xl border border-white/10 bg-black/20 p-3 hover:border-white/20 transition-colors"
            >
              <button
                type="button"
                title="Remove slide"
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/80 text-cream/70 opacity-0 hover:border-salsa hover:text-salsa group-hover:opacity-100 transition-all"
                onClick={() => {
                  const slides = settings.hero.slides.filter((_, i) => i !== idx);
                  setSettings({ ...settings, hero: { ...settings.hero, slides } });
                }}
              >
                ×
              </button>
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
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
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
      </CollapsibleSection>

      <CollapsibleSection id="prologue" title="Prologue" defaultOpen={false}>
        <div className="space-y-4">
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
      </CollapsibleSection>

      <CollapsibleSection id="story" title="Story" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
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
            Body
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={settings.story.body ?? ""}
              onChange={(e) => setSettings({ ...settings, story: { ...settings.story, body: e.target.value } })}
            />
          </label>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-editorial text-cream/70">Quotes</h3>
        <div className="mt-4 space-y-4">
          {(settings.story.quotes ?? []).map((q, idx) => (
            <div key={`story-quote-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
              <label className={labelClass}>
                Quote
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={q.quote}
                  onChange={(e) => {
                    const quotes = [...(settings.story.quotes ?? [])];
                    quotes[idx] = { ...quotes[idx]!, quote: e.target.value };
                    setSettings({ ...settings, story: { ...settings.story, quotes } });
                  }}
                />
              </label>
              <label className={labelClass}>
                Quote footer
                <input
                  className={inputClass}
                  value={q.footer}
                  onChange={(e) => {
                    const quotes = [...(settings.story.quotes ?? [])];
                    quotes[idx] = { ...quotes[idx]!, footer: e.target.value };
                    setSettings({ ...settings, story: { ...settings.story, quotes } });
                  }}
                />
              </label>
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
                onClick={() => {
                  const quotes = (settings.story.quotes ?? []).filter((_, i) => i !== idx);
                  setSettings({ ...settings, story: { ...settings.story, quotes } });
                }}
              >
                Remove quote
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
                  quotes: [...(settings.story.quotes ?? []), { quote: "", footer: "" }],
                },
              })
            }
          >
            + Add quote
          </button>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-editorial text-cream/70">Story carousel</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settings.story.slides.map((s, idx) => (
            <div
              key={`story-${idx}`}
              className="group relative rounded-xl border border-white/10 bg-black/20 p-3 hover:border-white/20 transition-colors"
            >
              <button
                type="button"
                title="Remove slide"
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/80 text-cream/70 opacity-0 hover:border-salsa hover:text-salsa group-hover:opacity-100 transition-all"
                onClick={() => {
                  const slides = settings.story.slides.filter((_, i) => i !== idx);
                  setSettings({ ...settings, story: { ...settings.story, slides } });
                }}
              >
                ×
              </button>
              <ImageAttachField
                label={`Slide ${idx + 1}`}
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
              <div className="mt-2 space-y-2">
                <input
                  className={`${inputClass} text-xs`}
                  placeholder="Kicker"
                  value={s.kicker}
                  onChange={(e) => {
                    const slides = [...settings.story.slides];
                    slides[idx] = { ...slides[idx]!, kicker: e.target.value };
                    setSettings({ ...settings, story: { ...settings.story, slides } });
                  }}
                />
                <input
                  className={`${inputClass} text-xs`}
                  placeholder="Line"
                  value={s.line}
                  onChange={(e) => {
                    const slides = [...settings.story.slides];
                    slides[idx] = { ...slides[idx]!, line: e.target.value };
                    setSettings({ ...settings, story: { ...settings.story, slides } });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
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
      </CollapsibleSection>

      <CollapsibleSection id="social" title="Social" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
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
      </CollapsibleSection>

      <CollapsibleSection id="catering" title="Catering" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
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

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-editorial text-cream/70">Quotes</h3>
        <div className="mt-4 space-y-4">
          {(settings.catering.quotes ?? []).map((q, idx) => (
            <div key={`catering-quote-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
              <label className={labelClass}>
                Quote
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={q.quote}
                  onChange={(e) => {
                    const quotes = [...(settings.catering.quotes ?? [])];
                    quotes[idx] = { ...quotes[idx]!, quote: e.target.value };
                    setSettings({ ...settings, catering: { ...settings.catering, quotes } });
                  }}
                />
              </label>
              <label className={labelClass}>
                Quote footer
                <input
                  className={inputClass}
                  value={q.footer}
                  onChange={(e) => {
                    const quotes = [...(settings.catering.quotes ?? [])];
                    quotes[idx] = { ...quotes[idx]!, footer: e.target.value };
                    setSettings({ ...settings, catering: { ...settings.catering, quotes } });
                  }}
                />
              </label>
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
                onClick={() => {
                  const quotes = (settings.catering.quotes ?? []).filter((_, i) => i !== idx);
                  setSettings({ ...settings, catering: { ...settings.catering, quotes } });
                }}
              >
                Remove quote
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-editorial text-cream/85 hover:bg-white/5"
            onClick={() =>
              setSettings({
                ...settings,
                catering: {
                  ...settings.catering,
                  quotes: [...(settings.catering.quotes ?? []), { quote: "", footer: "" }],
                },
              })
            }
          >
            + Add quote
          </button>
        </div>
      </CollapsibleSection>

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
