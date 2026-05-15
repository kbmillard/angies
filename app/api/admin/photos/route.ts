import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requirePhotosAdminSession } from "@/lib/admin/require-photos-session";
import { getPhotoRepository } from "@/lib/photos/repository";
import {
  putPublicImage,
  sanitizeOriginalFilename,
} from "@/lib/photos/storage";

export async function GET() {
  const gate = await requirePhotosAdminSession();
  if (gate) return gate;
  try {
    const repo = getPhotoRepository();
    const photos = await repo.list();
    return NextResponse.json({ ok: true, photos });
  } catch (e) {
    console.error("[admin/photos GET]", e);
    return NextResponse.json(
      { ok: false, error: "Failed to load photos" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const gate = await requirePhotosAdminSession();
  if (gate) return gate;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }

  const put = await putPublicImage(file);
  if (!put.ok) {
    return NextResponse.json({ ok: false, error: put.error }, { status: 400 });
  }

  const altRaw = form.get("alt_text");
  const catRaw = form.get("category");
  const alt_text = typeof altRaw === "string" ? altRaw.trim() : "";
  const category = typeof catRaw === "string" ? catRaw.trim() : "";

  try {
    const repo = getPhotoRepository();
    const photo = await repo.create({
      id: randomUUID(),
      url: put.value.url,
      filename: sanitizeOriginalFilename(file.name),
      alt_text,
      category,
    });
    return NextResponse.json({ ok: true, photo });
  } catch (e) {
    console.error("[admin/photos POST]", e);
    return NextResponse.json(
      { ok: false, error: "Failed to save photo metadata" },
      { status: 500 },
    );
  }
}
