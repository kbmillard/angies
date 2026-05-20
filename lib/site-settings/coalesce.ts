import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings/defaults";
import type {
  HeroCtaLabels,
  HeroSlideResolved,
  QuoteBlock,
  SectionCopyBlock,
  SiteSettingsResolved,
  SocialSettings,
  StorySlideResolved,
} from "@/lib/site-settings/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseHeroSlides(v: unknown): HeroSlideResolved[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out: HeroSlideResolved[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    const src = item.src;
    const alt = item.alt;
    if (!isNonEmptyString(src) || typeof alt !== "string") continue;
    out.push({ src: src.trim(), alt: alt.trim() });
  }
  return out.length > 0 ? dedupeHeroSlides(out) : null;
}

function parseStorySlides(v: unknown): StorySlideResolved[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out: StorySlideResolved[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    const src = item.src;
    const alt = item.alt;
    const kicker = item.kicker;
    const line = item.line;
    if (!isNonEmptyString(src) || typeof alt !== "string" || typeof kicker !== "string" || typeof line !== "string") {
      continue;
    }
    out.push({
      src: src.trim(),
      alt: alt.trim(),
      kicker: kicker.trim(),
      line: line.trim(),
    });
  }
  return out.length > 0 ? dedupeStorySlides(out) : null;
}

function parseSectionCopy(v: unknown): Partial<SectionCopyBlock> | null {
  if (!isRecord(v)) return null;
  const out: Partial<SectionCopyBlock> = {};
  for (const key of ["kicker", "title", "subtitle", "body"] as const) {
    const val = v[key];
    if (typeof val === "string") out[key] = val.trim();
  }
  return Object.keys(out).length > 0 ? out : null;
}

function parseSocial(v: unknown): Partial<SocialSettings> | null {
  const base = parseSectionCopy(v);
  if (!base && !isRecord(v)) return null;
  const out: Partial<SocialSettings> = { ...base };
  if (isRecord(v)) {
    if (typeof v.instagramHandle === "string") out.instagramHandle = v.instagramHandle.trim();
    if (typeof v.facebookHandle === "string") out.facebookHandle = v.facebookHandle.trim();
  }
  return Object.keys(out).length > 0 ? out : null;
}

function parseCta(v: unknown): Partial<HeroCtaLabels> | null {
  if (!isRecord(v)) return null;
  const out: Partial<HeroCtaLabels> = {};
  for (const key of ["order", "viewMenu", "findTruck", "schedule", "catering"] as const) {
    const val = v[key];
    if (typeof val === "string" && val.trim()) out[key] = val.trim();
  }
  return Object.keys(out).length > 0 ? out : null;
}

function dedupeHeroSlides(slides: HeroSlideResolved[]): HeroSlideResolved[] {
  const seen = new Set<string>();
  return slides.filter((s) => {
    if (seen.has(s.src)) return false;
    seen.add(s.src);
    return true;
  });
}

function dedupeStorySlides(slides: StorySlideResolved[]): StorySlideResolved[] {
  const seen = new Set<string>();
  return slides.filter((s) => {
    if (seen.has(s.src)) return false;
    seen.add(s.src);
    return true;
  });
}

function parseQuotes(v: unknown): QuoteBlock[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out: QuoteBlock[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    const quote = item.quote;
    const footer = item.footer;
    if (typeof quote !== "string") continue;
    out.push({
      quote: quote.trim(),
      footer: typeof footer === "string" ? footer.trim() : "",
    });
  }
  return out.length > 0 ? out : null;
}

function migrateOldQuotes(storyIn: Record<string, unknown>): QuoteBlock[] {
  const quotes: QuoteBlock[] = [];
  const q1 = storyIn.quote1;
  const q2 = storyIn.quote2;
  const footer = storyIn.quoteFooter;
  if (typeof q1 === "string" && q1.trim()) {
    quotes.push({ quote: q1.trim(), footer: "" });
  }
  if (typeof q2 === "string" && q2.trim()) {
    quotes.push({
      quote: q2.trim(),
      footer: typeof footer === "string" ? footer.trim() : "",
    });
  }
  return quotes;
}

/** Merge stored JSON with built-in defaults so new keys ship without DB migrations. */
export function coalesceSiteSettings(stored: unknown): SiteSettingsResolved {
  const d = DEFAULT_SITE_SETTINGS;
  if (!isRecord(stored)) return d;

  const heroIn = isRecord(stored.hero) ? stored.hero : null;
  const proIn = isRecord(stored.prologue) ? stored.prologue : null;
  const storyIn = isRecord(stored.story) ? stored.story : null;
  const cateringIn = parseSectionCopy(stored.catering);
  const socialIn = parseSocial(stored.social);

  const heroSlides = heroIn ? parseHeroSlides(heroIn.slides) : null;
  const heroCta = heroIn ? parseCta(heroIn.cta) : null;

  const storySlides = storyIn ? parseStorySlides(storyIn.slides) : null;

  return {
    hero: {
      eyebrow: typeof heroIn?.eyebrow === "string" && heroIn.eyebrow.trim() ? heroIn.eyebrow.trim() : d.hero.eyebrow,
      headlineLine1:
        typeof heroIn?.headlineLine1 === "string" && heroIn.headlineLine1.trim()
          ? heroIn.headlineLine1.trim()
          : d.hero.headlineLine1,
      headlineLine2:
        typeof heroIn?.headlineLine2 === "string" && heroIn.headlineLine2.trim()
          ? heroIn.headlineLine2.trim()
          : d.hero.headlineLine2,
      body: typeof heroIn?.body === "string" && heroIn.body.trim() ? heroIn.body.trim() : d.hero.body,
      slides: heroSlides ?? d.hero.slides,
      cta: { ...d.hero.cta, ...(heroCta ?? {}) },
    },
    prologue: {
      title: typeof proIn?.title === "string" && proIn.title.trim() ? proIn.title.trim() : d.prologue.title,
      subtitle:
        typeof proIn?.subtitle === "string" && proIn.subtitle.trim() ? proIn.subtitle.trim() : d.prologue.subtitle,
    },
    menu: {
      kicker: isRecord(stored.menu) && typeof stored.menu.kicker === "string" && stored.menu.kicker.trim()
        ? stored.menu.kicker.trim()
        : d.menu.kicker,
      title: isRecord(stored.menu) && typeof stored.menu.title === "string" && stored.menu.title.trim()
        ? stored.menu.title.trim()
        : d.menu.title,
      subtitle: isRecord(stored.menu) && typeof stored.menu.subtitle === "string" && stored.menu.subtitle.trim()
        ? stored.menu.subtitle.trim()
        : d.menu.subtitle,
    },
    location: {
      title: isRecord(stored.location) && typeof stored.location.title === "string" && stored.location.title.trim()
        ? stored.location.title.trim()
        : d.location.title,
      subtitle: isRecord(stored.location) && typeof stored.location.subtitle === "string" && stored.location.subtitle.trim()
        ? stored.location.subtitle.trim()
        : d.location.subtitle,
    },
    story: {
      sectionKicker:
        typeof storyIn?.sectionKicker === "string" && storyIn.sectionKicker.trim()
          ? storyIn.sectionKicker.trim()
          : d.story.sectionKicker,
      sectionTitle:
        typeof storyIn?.sectionTitle === "string" && storyIn.sectionTitle.trim()
          ? storyIn.sectionTitle.trim()
          : d.story.sectionTitle,
      body: typeof storyIn?.body === "string" ? storyIn.body.trim() : d.story.body,
      quotes: storyIn
        ? (parseQuotes(storyIn.quotes) ?? migrateOldQuotes(storyIn))
        : d.story.quotes,
      slides: storySlides ?? d.story.slides,
    },
    catering: {
      ...d.catering,
      ...(cateringIn ?? {}),
      quotes: isRecord(stored.catering) ? (parseQuotes(stored.catering.quotes) ?? []) : [],
    },
    social: { ...d.social, ...(socialIn ?? {}) },
  };
}
