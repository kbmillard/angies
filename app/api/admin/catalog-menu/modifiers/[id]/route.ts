import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import {
  dbUpdateCatalogModifier,
  type CatalogModifierPatch,
} from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

function parsePatch(body: unknown): CatalogModifierPatch | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const patch: CatalogModifierPatch = {};
  if (typeof b.name === "string") patch.name = b.name.trim();
  if (typeof b.amount === "number" && Number.isFinite(b.amount)) patch.amount = b.amount;
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) patch.sortOrder = b.sortOrder;
  return patch;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
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
    const ok = await dbUpdateCatalogModifier(id, patch);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Modifier not found" }, { status: 404 });
    }
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
