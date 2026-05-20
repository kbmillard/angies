export type HeroSlideResolved = {
  src: string;
  alt: string;
};

export type StorySlideResolved = {
  src: string;
  alt: string;
  kicker: string;
  line: string;
};

export type HeroCtaLabels = {
  order: string;
  viewMenu: string;
  findTruck: string;
  schedule: string;
  catering: string;
};

export type SectionCopyBlock = {
  kicker: string;
  title: string;
  subtitle: string;
  body?: string;
};

export type QuoteBlock = {
  quote: string;
  footer: string;
};

export type SocialSettings = SectionCopyBlock & {
  instagramHandle?: string;
  facebookHandle?: string;
};

export type SiteSettingsResolved = {
  hero: {
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    body: string;
    slides: HeroSlideResolved[];
    cta: HeroCtaLabels;
  };
  prologue: {
    title: string;
    subtitle: string;
  };
  story: {
    sectionKicker: string;
    sectionTitle: string;
    body?: string;
    quotes: QuoteBlock[];
    slides: StorySlideResolved[];
  };
  catering: SectionCopyBlock & {
    quotes: QuoteBlock[];
  };
  social: SocialSettings;
};
