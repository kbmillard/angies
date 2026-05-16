import { NextResponse } from "next/server";
import { loadSiteSettingsResolved } from "@/lib/site-settings/load";

export async function GET() {
  try {
    const settings = await loadSiteSettingsResolved();
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    console.error("[site-settings GET]", e);
    return NextResponse.json({ ok: false, error: "Failed to load site settings" }, { status: 500 });
  }
}
