import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { dbUpdateCategory, dbDeleteCategory } from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const patch: { name?: string; sortOrder?: number } = {};
  if (typeof b.name === "string") patch.name = b.name.trim();
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) patch.sortOrder = b.sortOrder;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields" }, { status: 400 });
  }

  const ok = await dbUpdateCategory(slug, patch);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
  }
  revalidatePublicCatalog();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
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

  const result = await dbDeleteCategory(slug);
  if (!result.deleted) {
    return NextResponse.json({ ok: false, error: result.error ?? "Delete failed" }, { status: 400 });
  }
  revalidatePublicCatalog();
  return NextResponse.json({ ok: true });
}
