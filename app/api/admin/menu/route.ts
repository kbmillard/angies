import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { parseMenuItemForAdmin } from "@/lib/admin/parse-menu-body";
import { getSql } from "@/lib/db/sql";
import { dbGetMenuItems, dbInsertMenuItem } from "@/lib/catalog-db/menu-db";

export async function GET() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is required to edit the catalog in the admin." },
      { status: 503 },
    );
  }
  try {
    const items = await dbGetMenuItems(true);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("[admin/menu GET]", e);
    return NextResponse.json({ ok: false, error: "Failed to load menu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
  const parsed = parseMenuItemForAdmin(body, { idOptional: true });
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  try {
    const created = await dbInsertMenuItem(parsed.item);
    if (!created) {
      return NextResponse.json(
        { ok: false, error: "Could not save (database unavailable?)" },
        { status: 503 },
      );
    }
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    console.error("[admin/menu POST]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Insert failed" },
      { status: 500 },
    );
  }
}
