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
    quote1: string;
    quote2: string;
    quoteFooter: string;
    slides: StorySlideResolved[];
  };
};
