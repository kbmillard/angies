import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import {
  dbGetItemMeatPrices,
  dbGetRelationalMenuAsMenuItems,
  dbUpdateCatalogMenuItem,
  type CatalogMenuItemPatch,
} from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

function parsePatch(body: unknown): CatalogMenuItemPatch | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const patch: CatalogMenuItemPatch = {};
  if (typeof b.name === "string") patch.name = b.name.trim();
  if (typeof b.description === "string") patch.description = b.description;
  if (typeof b.basePrice === "number" && Number.isFinite(b.basePrice)) patch.basePrice = b.basePrice;
  if (typeof b.requiresMeatSelection === "boolean") patch.requiresMeatSelection = b.requiresMeatSelection;
  if (b.imageUrl === null || typeof b.imageUrl === "string") patch.imageUrl = b.imageUrl;
  if (b.imageAlt === null || typeof b.imageAlt === "string") patch.imageAlt = b.imageAlt;
  if (typeof b.active === "boolean") patch.active = b.active;
  if (typeof b.featured === "boolean") patch.featured = b.featured;
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) patch.sortOrder = b.sortOrder;
  if (typeof b.categorySlug === "string") patch.categorySlug = b.categorySlug.trim();
  return patch;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }

  const { slug } = await ctx.params;
  if (!slug?.trim()) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const patch = parsePatch(body);
  if (!patch || Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const ok = await dbUpdateCatalogMenuItem(slug, patch);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Item not found" }, { status: 404 });
    }
    const items = await dbGetRelationalMenuAsMenuItems(true);
    const item = items.find((i) => i.id === slug);
    const meatPrices = await dbGetItemMeatPrices(slug);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, item, meatPrices });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
