import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { getSql } from "@/lib/db/sql";
import { importMenuFromJsonString } from "@/lib/catalog-db/menu-relational-db";

export async function POST(req: Request) {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is required." },
      { status: 503 },
    );
  }

  const raw = await req.text();
  if (!raw.trim()) {
    return NextResponse.json({ ok: false, error: "Empty body" }, { status: 400 });
  }

  try {
    const result = await importMenuFromJsonString(raw);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
