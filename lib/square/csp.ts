/**
 * Content-Security-Policy for Square Web Payments SDK + site needs (Maps, Blob, Next.js).
 * Branches on NEXT_PUBLIC_SQUARE_ENVIRONMENT at build time.
 * @see https://developer.squareup.com/docs/web-payments/content-security-policy
 */
export function buildSquareContentSecurityPolicy(): string {
  const isProd =
    (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase() ===
    "production";

  if (isProd) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://js.squareup.com",
      "frame-src 'self' https://web.squarecdn.com https://www.google.com https://maps.googleapis.com https://maps.google.com",
      "connect-src 'self' https://web.squarecdn.com https://api.squareup.com https://pci-connect.squareup.com https://o160250.ingest.sentry.io https://*.public.blob.vercel-storage.com https://vitals.vercel-insights.com",
      "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://square-fonts-production-f.squarecdn.com",
      "font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://cash-f.squarecdn.com",
      "img-src 'self' data: blob: https:",
    ].join("; ");
  }

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.web.squarecdn.com https://js.squareupsandbox.com",
    "frame-src 'self' https://sandbox.web.squarecdn.com https://www.google.com https://maps.googleapis.com https://maps.google.com",
    "connect-src 'self' https://sandbox.web.squarecdn.com https://pci-connect.squareupsandbox.com https://o160250.ingest.sentry.io https://*.public.blob.vercel-storage.com https://vitals.vercel-insights.com",
    "style-src 'self' 'unsafe-inline' https://sandbox.web.squarecdn.com https://square-fonts-production-f.squarecdn.com",
    "font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://cash-f.squarecdn.com",
    "img-src 'self' data: blob: https:",
  ].join("; ");
}
