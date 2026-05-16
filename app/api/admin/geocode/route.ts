import { NextResponse } from "next/server";
import { requireAdminGate } from "@/lib/admin/require-admin-gate";
import { parseDmsCoordinates } from "@/lib/geocode/geocode-address";
import { geocodeAddress } from "@/lib/geocode/geocode-server";

/**
 * Admin-only: forward geocode or parse DMS paste (Google Earth style).
 * Body: { address: string } and/or { paste: string } — paste tried first for coordinates.
 */
export async function POST(req: Request) {
  const gate = await requireAdminGate();
  if (gate) return gate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const paste = typeof o.paste === "string" ? o.paste.trim() : "";
  if (paste) {
    const dms = parseDmsCoordinates(paste);
    if (dms) {
      return NextResponse.json({
        ok: true,
        latitude: dms.lat,
        longitude: dms.lng,
        source: "dms",
      });
    }
  }

  const address = typeof o.address === "string" ? o.address.trim() : "";
  if (!address) {
    return NextResponse.json(
      { ok: false, error: "Provide address (full line) or paste with DMS coordinates" },
      { status: 400 },
    );
  }

  const result = await geocodeAddress(address);
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Geocode returned no results (check address or add Mapbox / server Google key)" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, ...result, source: "geocode" });
}
