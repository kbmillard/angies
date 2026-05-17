import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Caveat, DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  LOCAL_BUSINESS_SCHEMA,
  SITE_NAME,
} from "@/lib/seo";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const script = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-script",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://angieskc.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: "/icons/logo-512x512.png", width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/icons/logo-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      {
        url: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/icons/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const schema = {
    ...LOCAL_BUSINESS_SCHEMA,
    image: `${siteUrl}/icons/logo-512x512.png`,
    url: siteUrl,
  };

  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${script.variable} ${mono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {children}
      </body>
    </html>
  );
}
