import { NextResponse } from "next/server";
import { getLocationsCatalog } from "@/lib/locations/get-locations";

/**
 * Locations JSON must be built at **request** time so server env (geocoding + embed
 * keys) is applied. Static ISR of this route can cache a pre-geocode payload from
 * build and leave the client without `lat`/`lng`/`mapEmbedSrc`.
 * Upstream Sheet CSV is still cached ~5m via `fetch(..., { next: { revalidate: 300 } })`.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const body = await getLocationsCatalog();
  return NextResponse.json(body);
}
