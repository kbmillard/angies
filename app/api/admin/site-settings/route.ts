import { NextResponse } from "next/server";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { coalesceSiteSettings } from "@/lib/site-settings/coalesce";
import { dbGetSiteSettingsPayload, dbSaveSiteSettingsPayload } from "@/lib/site-settings/db";
import { loadSiteSettingsResolved } from "@/lib/site-settings/load";
import type { SiteSettingsResolved } from "@/lib/site-settings/types";
import { getSql } from "@/lib/db/sql";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function looksLikeSiteSettings(body: unknown): body is SiteSettingsResolved {
  if (!isRecord(body)) return false;
  const hero = body.hero;
  const prologue = body.prologue;
  const story = body.story;
  if (!isRecord(hero) || !isRecord(prologue) || !isRecord(story)) return false;
  if (typeof hero.eyebrow !== "string") return false;
  if (!Array.isArray(hero.slides)) return false;
  if (typeof prologue.title !== "string") return false;
  if (!Array.isArray(story.slides)) return false;
  return true;
}

export async function GET() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is required for site settings admin." },
      { status: 503 },
    );
  }
  try {
    const raw = await dbGetSiteSettingsPayload();
    const merged = await loadSiteSettingsResolved();
    return NextResponse.json({ ok: true, rawPayload: raw ?? {}, merged });
  } catch (e) {
    console.error("[admin/site-settings GET]", e);
    return NextResponse.json({ ok: false, error: "Failed to load site settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!looksLikeSiteSettings(body)) {
    return NextResponse.json({ ok: false, error: "Invalid site settings body." }, { status: 400 });
  }
  try {
    const cleaned = coalesceSiteSettings(body);
    await dbSaveSiteSettingsPayload(cleaned);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, settings: cleaned });
  } catch (e) {
    console.error("[admin/site-settings PUT]", e);
    return NextResponse.json({ ok: false, error: "Failed to save site settings" }, { status: 500 });
  }
}
