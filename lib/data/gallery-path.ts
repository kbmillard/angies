/** Local gallery files live under `public/gallery` (synced from repo `gallery/`). */
export function gallerySrc(filename: string): string {
  return `/gallery/${encodeURIComponent(filename)}`;
}
