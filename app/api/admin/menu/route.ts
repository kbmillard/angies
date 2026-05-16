import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { parseMenuItemForAdmin } from "@/lib/admin/parse-menu-body";
import { getSql } from "@/lib/db/sql";
import { dbGetMenuItems, dbInsertMenuItem } from "@/lib/catalog-db/menu-db";
import {
  dbGetRelationalMenuAsMenuItems,
  isRelationalMenuCatalogActive,
} from "@/lib/catalog-db/menu-relational-db";

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
    const relational = await isRelationalMenuCatalogActive();
    const items = relational
      ? await dbGetRelationalMenuAsMenuItems(true)
      : await dbGetMenuItems(true);
    return NextResponse.json({
      ok: true,
      items,
      catalogSource: relational ? ("relational" as const) : ("legacy" as const),
    });
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
  if (await isRelationalMenuCatalogActive()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Relational menu is active. Use Menu → Import menu JSON (or POST /api/admin/menu-import) to replace the catalog.",
      },
      { status: 409 },
    );
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
