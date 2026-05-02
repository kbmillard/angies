import { NextResponse } from "next/server";
import { getScheduleCatalog } from "@/lib/schedule/get-schedule";

export const revalidate = 300;

export async function GET() {
  const body = await getScheduleCatalog();
  return NextResponse.json(body);
}
