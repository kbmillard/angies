import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_PHOTOS_COOKIE,
  isAdminPasswordConfigured,
  verifyAdminSession,
} from "./session";

export async function requirePhotosAdminSession(): Promise<Response | null> {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin is not configured (set ADMIN_PHOTOS_PASSWORD)." },
      { status: 503 },
    );
  }
  const jar = await cookies();
  const token = jar.get(ADMIN_PHOTOS_COOKIE)?.value;
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
