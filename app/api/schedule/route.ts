import { NextResponse } from "next/server";
import { getScheduleCatalog } from "@/lib/schedule/get-schedule";

/**
 * Schedule JSON is built at request time so admin DB updates show immediately.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const body = await getScheduleCatalog();
  return NextResponse.json(body);
}
