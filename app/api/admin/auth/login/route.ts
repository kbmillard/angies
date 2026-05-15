import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ADMIN_PHOTOS_COOKIE,
  isAdminPasswordConfigured,
  signAdminSession,
} from "@/lib/admin/session";

function verifyGatePassword(guess: string, expected: string): boolean {
  const g = createHash("sha256").update(guess, "utf8").digest();
  const e = createHash("sha256").update(expected, "utf8").digest();
  return g.length === e.length && timingSafeEqual(g, e);
}

export async function POST(req: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin gate is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const expected = process.env.ADMIN_PHOTOS_PASSWORD ?? "";

  if (!verifyGatePassword(password, expected)) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const token = signAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_PHOTOS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
