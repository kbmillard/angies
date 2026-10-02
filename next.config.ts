import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NEXT_IMAGE_HOSTS } from "./lib/photos/public-image";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    contentDispositionType: "inline",
    remotePatterns: NEXT_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    })),
  },
  // Site-wide CSP removed: merged policy blocked Square card mount for some users.
  // lib/square/csp.ts remains if PCI/compliance needs headers later.
};

export default nextConfig;
