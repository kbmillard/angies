import { NextResponse } from "next/server";
import { getMenuCatalog } from "@/lib/menu/get-menu";

/** Menu JSON is regenerated at most every ~5 minutes (see also fetch revalidate in get-menu). */
export const revalidate = 300;

export async function GET() {
  const body = await getMenuCatalog();
  return NextResponse.json(body);
}
