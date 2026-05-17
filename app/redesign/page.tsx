import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${HOME_TITLE} (preview)`,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "https://angieskc.com/" },
  robots: { index: false, follow: false },
};

/** Full homepage preview — same as `/`, shareable before promoting to root. */
export default function RedesignPreviewPage() {
  return <HomePage />;
}
