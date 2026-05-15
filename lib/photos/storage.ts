import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 12 * 1024 * 1024;

export function sanitizeOriginalFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "image";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
  return cleaned || "image";
}

export function assertImageFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return `File too large (max ${Math.round(MAX_BYTES / (1024 * 1024))} MB).`;
  }
  return null;
}

/** Unique storage key under uploads prefix */
export function buildStoredFilename(original: string): string {
  const safe = sanitizeOriginalFilename(original);
  const ext =
    safe.includes(".") ? safe.slice(safe.lastIndexOf(".")) : "";
  const stem = ext ? safe.slice(0, -ext.length) : safe;
  return `${Date.now()}-${stem}${ext || ".jpg"}`;
}

export type StoredPublicImage = {
  url: string;
  filename: string;
};

/**
 * Upload bytes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.
 * In development without a token, writes under `public/gallery/uploads/` and
 * returns a site-relative URL.
 */
export async function putPublicImage(
  file: File,
): Promise<{ ok: true; value: StoredPublicImage } | { ok: false; error: string }> {
  const err = assertImageFile(file);
  if (err) return { ok: false, error: err };

  const storedName = buildStoredFilename(file.name);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const blob = await put(`angies/menu/${storedName}`, file, {
      access: "public",
      token,
      addRandomSuffix: false,
    });
    return {
      ok: true,
      value: { url: blob.url, filename: storedName },
    };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error:
        "File upload is not configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) for production uploads.",
    };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "gallery", "uploads");
  await mkdir(dir, { recursive: true });
  const diskPath = path.join(dir, storedName);
  await writeFile(diskPath, buf);
  return {
    ok: true,
    value: {
      url: `/gallery/uploads/${storedName}`,
      filename: storedName,
    },
  };
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}
