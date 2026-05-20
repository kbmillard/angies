import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { dbListCategories, dbInsertCategory } from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

export async function GET() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }
  const categories = await dbListCategories();
  return NextResponse.json({ ok: true, categories });
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim()) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }

  try {
    const cat = await dbInsertCategory(b.name.trim());
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, category: cat });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
