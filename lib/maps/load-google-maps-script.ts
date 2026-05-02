/**
 * Singleton loader for the Maps JavaScript API (browser only).
 * Embed API iframes cannot set gestureHandling (Google shows cooperative UI there). Prefer JS maps.
 */
let loadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    __foodtruckGmapsInit?: () => void;
  }
}

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.google?.maps) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    window.__foodtruckGmapsInit = () => {
      resolve();
    };

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=__foodtruckGmapsInit`;
    s.onerror = () => {
      loadPromise = null;
      delete window.__foodtruckGmapsInit;
      reject(new Error("Google Maps script failed to load"));
    };
    document.head.appendChild(s);
  });

  return loadPromise;
}
