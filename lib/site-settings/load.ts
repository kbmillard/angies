import { coalesceSiteSettings } from "@/lib/site-settings/coalesce";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings/defaults";
import { dbGetSiteSettingsPayload } from "@/lib/site-settings/db";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";

export async function loadSiteSettingsResolved(): Promise<SiteSettingsResolved> {
  const raw = await dbGetSiteSettingsPayload();
  if (raw == null) return DEFAULT_SITE_SETTINGS;
  return coalesceSiteSettings(raw);
}

export type { SiteSettingsResolved };
