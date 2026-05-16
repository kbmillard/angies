import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { seedCatalogFromBuiltinsIfEmpty } from "@/lib/catalog-db/seed";
import { getSql } from "@/lib/db/sql";

export async function POST() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }
  const result = await seedCatalogFromBuiltinsIfEmpty();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  revalidatePublicCatalog();
  return NextResponse.json({ ok: true, seeded: result.seeded });
}
