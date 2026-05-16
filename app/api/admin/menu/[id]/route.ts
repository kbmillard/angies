import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { parseMenuItemForAdmin } from "@/lib/admin/parse-menu-body";
import { getSql } from "@/lib/db/sql";
import { dbUpdateMenuItem, dbDeleteMenuItem } from "@/lib/catalog-db/menu-db";

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

  const parsed = parseMenuItemForAdmin(body, { idOptional: false });
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  if (parsed.item.id !== id) {
    return NextResponse.json({ ok: false, error: "Body id must match URL" }, { status: 400 });
  }

  try {
    const updated = await dbUpdateMenuItem(id, parsed.item);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    console.error("[admin/menu PATCH]", e);
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
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
  try {
    const deleted = await dbDeleteMenuItem(id.trim());
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/menu DELETE]", e);
    return NextResponse.json({ ok: false, error: "Delete failed" }, { status: 500 });
  }
}
