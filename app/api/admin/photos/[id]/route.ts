import { NextResponse } from "next/server";
import { requirePhotosAdminSession } from "@/lib/admin/require-photos-session";
import { getPhotoRepository } from "@/lib/photos/repository";

type PatchBody = {
  alt_text?: string;
  category?: string;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requirePhotosAdminSession();
  if (gate) return gate;

  const { id } = await ctx.params;
  if (!id || !/^[0-9a-f-]{16,}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Partial<{ alt_text: string; category: string }> = {};
  if (typeof body.alt_text === "string") patch.alt_text = body.alt_text;
  if (typeof body.category === "string") patch.category = body.category;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  try {
    const repo = getPhotoRepository();
    const photo = await repo.update(id, patch);
    if (!photo) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, photo });
  } catch (e) {
    console.error("[admin/photos PATCH]", e);
    return NextResponse.json(
      { ok: false, error: "Failed to update photo" },
      { status: 500 },
    );
  }
}
