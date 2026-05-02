import { gallerySrc } from "@/lib/data/gallery-path";

/** Canonical food gallery filenames (`gallery/` → `public/gallery/`). */
export const GALLERY_FOOD_SHOTS = [
  { file: "food.png", alt: "Mexican plate from Angie’s Food Truck" },
  { file: "food1.png", alt: "Fresh Mexican food" },
  { file: "food2.png", alt: "Angie’s window favorites" },
  { file: "food3.jpg", alt: "Rice and sides" },
  { file: "food4.png", alt: "Tacos and salsa" },
  { file: "food5.png", alt: "Loaded plate" },
  { file: "food6.png", alt: "Mexican specialties" },
  { file: "food7.jpg", alt: "Tacos" },
  { file: "food8.jpg", alt: "Street tacos" },
  { file: "food9.jpg", alt: "Truck favorites" },
  { file: "food10.jpg", alt: "Birria and sides" },
  { file: "food11.jpg", alt: "Burrito build" },
  { file: "food12.jpg", alt: "Daily special" },
  { file: "food13.png", alt: "Fresh Mexican flavors" },
  { file: "food14.png", alt: "Colorful plates" },
  { file: "food15.jpg", alt: "Beans and toppings" },
  { file: "food16.png", alt: "Angie’s spread" },
  { file: "food17.png", alt: "Mexican food truck plate" },
  { file: "food18.png", alt: "Fresh-made order" },
  { file: "food19.png", alt: "Truck menu favorites" },
  { file: "food20.png", alt: "Hearty Mexican plate" },
  { file: "food21.png", alt: "From the window" },
  { file: "food24.jpg", alt: "Angie’s Food Truck plate" },
] as const;

/** Normalize `/gallery/...` paths for deduplication. */
export function galleryDedupeKey(src: string): string {
  const path = src.trim().split("?")[0] ?? "";
  const m = /^\/gallery\/(.+)$/i.exec(path);
  if (!m?.[1]) return path.toLowerCase();
  try {
    return decodeURIComponent(m[1]).toLowerCase();
  } catch {
    return m[1].toLowerCase();
  }
}

export function galleryShotSrc(file: string): string {
  return gallerySrc(file);
}
