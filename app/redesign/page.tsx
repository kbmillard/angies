import type { Metadata } from "next";
import { RedesignHomePage } from "@/components/redesign/RedesignHomePage";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${HOME_TITLE} (preview)`,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "https://angieskc.com/" },
  robots: { index: false, follow: false },
};

/** Redesign preview only — production homepage stays at `/`. */
export default function RedesignPreviewPage() {
  return <RedesignHomePage />;
}
