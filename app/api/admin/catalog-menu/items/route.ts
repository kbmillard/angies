import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { dbInsertCatalogMenuItem, type NewItemData } from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

function parseNewItem(body: unknown): NewItemData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim()) return null;
  if (typeof b.categorySlug !== "string" || !b.categorySlug.trim()) return null;

  const data: NewItemData = {
    name: b.name.trim(),
    categorySlug: b.categorySlug.trim(),
  };
  if (typeof b.basePrice === "number" && Number.isFinite(b.basePrice)) {
    data.basePrice = b.basePrice;
  }
  if (typeof b.description === "string") {
    data.description = b.description;
  }
  if (typeof b.requiresMeatSelection === "boolean") {
    data.requiresMeatSelection = b.requiresMeatSelection;
  }
  if (b.imageUrl === null || typeof b.imageUrl === "string") {
    data.imageUrl = b.imageUrl;
  }
  return data;
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

  const data = parseNewItem(body);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Name and category are required" }, { status: 400 });
  }

  try {
    const { slug } = await dbInsertCatalogMenuItem(data);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
