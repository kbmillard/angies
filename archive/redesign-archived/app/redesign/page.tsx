import type { Metadata } from "next";
import { RedesignHomePage } from "@/components/redesign/RedesignHomePage";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://angieskc.com";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: `${siteUrl}/redesign` },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: `${siteUrl}/redesign`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
};

export default function RedesignHomeRoute() {
  return <RedesignHomePage />;
}
