/**
 * Content-Security-Policy for Square Web Payments SDK.
 * @see https://developer.squareup.com/docs/web-payments/content-security-policy
 */
export function buildSquareContentSecurityPolicy(): string {
  const isProd =
    (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase() ===
    "production";

  const squareCdn = isProd
    ? "https://web.squarecdn.com"
    : "https://sandbox.web.squarecdn.com";
  const pciConnect = isProd
    ? "https://pci-connect.squareup.com"
    : "https://pci-connect.squareupsandbox.com";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${squareCdn}`,
    `frame-src 'self' ${squareCdn} https://www.google.com https://maps.googleapis.com`,
    `connect-src 'self' ${squareCdn} ${pciConnect} https://o160250.ingest.sentry.io https://*.public.blob.vercel-storage.com https://vitals.vercel-insights.com`,
    `style-src 'self' 'unsafe-inline' ${squareCdn}`,
    "font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://cash-f.squarecdn.com",
    "img-src 'self' data: blob: https:",
  ].join("; ");
}
