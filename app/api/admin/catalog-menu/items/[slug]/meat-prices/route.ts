import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import {
  dbGetItemMeatPrices,
  dbSetItemMeatPrices,
} from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }
  const { slug } = await ctx.params;
  const meatPrices = await dbGetItemMeatPrices(slug);
  return NextResponse.json({ ok: true, meatPrices });
}

export async function PUT(
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

  const pricesRaw = (body as { prices?: unknown })?.prices;
  if (!Array.isArray(pricesRaw)) {
    return NextResponse.json({ ok: false, error: "prices array required" }, { status: 400 });
  }

  const prices: { meatSlug: string; price: number | null }[] = [];
  for (const row of pricesRaw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const meatSlug = typeof r.meatSlug === "string" ? r.meatSlug.trim() : "";
    if (!meatSlug) continue;
    if (r.price === null || r.price === undefined || r.price === "") {
      prices.push({ meatSlug, price: null });
      continue;
    }
    const price = typeof r.price === "number" ? r.price : Number(r.price);
    if (!Number.isFinite(price)) continue;
    prices.push({ meatSlug, price });
  }

  try {
    await dbSetItemMeatPrices(slug, prices);
    const meatPrices = await dbGetItemMeatPrices(slug);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, meatPrices });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
