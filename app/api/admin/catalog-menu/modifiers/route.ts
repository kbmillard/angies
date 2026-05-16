import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { dbListCatalogModifiers } from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

export async function GET() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }
  try {
    const modifiers = await dbListCatalogModifiers();
    return NextResponse.json({ ok: true, modifiers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load modifiers";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
