import { SOCIAL_LINKS } from "@/lib/data/social";

export const SITE_NAME = "Angie's Food Truck";

export const HOME_TITLE = "Angie's Food Truck | Kansas City Mexican Food Truck";

export const HOME_DESCRIPTION =
  "Find Angie's Food Truck in Kansas City for Mexican food, tacos, birria, burritos, aguas frescas, catering, and daily truck updates.";

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Angie's food truck",
  alternateName: "Angie's Food Truck",
  telephone: "+1-913-433-1732, +1-913-954-8745",
  email: "angiesfoodtruck83@gmail.com",
  servesCuisine: "Mexican",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "400 E Linwood Blvd",
    addressLocality: "Kansas City",
    addressRegion: "MO",
    postalCode: "64109",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "City",
    name: "Kansas City",
  },
  image: "/icons/logo-512x512.png",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://angies-food-truck.example",
  sameAs: [SOCIAL_LINKS.instagram.href, SOCIAL_LINKS.facebook.href],
};
