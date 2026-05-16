import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { importMenuFromJsonString } from "@/lib/catalog-db/menu-relational-db";
import { getSql } from "@/lib/db/sql";

const MENU_JSON = path.join(process.cwd(), "public/menu/menu_final/menu.json");

/** Replace live catalog with the committed `public/menu/menu_final/menu.json`. */
export async function POST() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required." }, { status: 503 });
  }

  let raw: string;
  try {
    raw = await readFile(MENU_JSON, "utf8");
  } catch {
    return NextResponse.json({ ok: false, error: "menu.json not found on server." }, { status: 500 });
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
