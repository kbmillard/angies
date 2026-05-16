import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate-public";
import { parseScheduleItemForAdmin } from "@/lib/admin/parse-schedule-body";
import { getSql } from "@/lib/db/sql";
import {
  dbGetScheduleItems,
  dbInsertScheduleItem,
} from "@/lib/catalog-db/schedule-db";

export async function GET() {
  const gate = await requireAdminGate();
  if (gate) return gate;
  if (!getSql()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is required for catalog admin." },
      { status: 503 },
    );
  }
  try {
    const items = await dbGetScheduleItems(true);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("[admin/schedule GET]", e);
    return NextResponse.json({ ok: false, error: "Failed to load schedule" }, { status: 500 });
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
  const parsed = parseScheduleItemForAdmin(body, { idOptional: true });
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  try {
    const created = await dbInsertScheduleItem(parsed.item);
    if (!created) {
      return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
    }
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    console.error("[admin/schedule POST]", e);
    return NextResponse.json({ ok: false, error: "Insert failed" }, { status: 500 });
  }
}
