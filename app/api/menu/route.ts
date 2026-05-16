import { NextResponse } from "next/server";
import { getMenuCatalog } from "@/lib/menu/get-menu";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await getMenuCatalog();
  return NextResponse.json(body);
}
