import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { dbListCatalogModifiers, dbCreateCatalogModifier } from "@/lib/catalog-db/menu-relational-db";
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

export async function POST(req: Request) {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }
  try {
    const body = (await req.json()) as { kind?: string; name?: string; amount?: number };
    const { kind, name, amount } = body;
    if (!kind || !["meat", "side", "topping"].includes(kind)) {
      return NextResponse.json({ ok: false, error: "Invalid kind. Must be meat, side, or topping." }, { status: 400 });
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    }
    const result = await dbCreateCatalogModifier(kind as "meat" | "side" | "topping", name, amount ?? 0);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create modifier";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
