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

const HEIC_BRANDS = new Set(["heic", "heix", "heif", "mif1", "msf1"]);

export function sanitizeOriginalFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "image";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
  return cleaned || "image";
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end));
}

/** Detect a real image type from magic bytes so iOS empty/`image/heic` types still work. */
export function sniffImageMime(bytes: Uint8Array, reportedType = ""): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp") {
    const brand = ascii(bytes, 8, 12).toLowerCase();
    if (HEIC_BRANDS.has(brand)) return null;
  }

  const reported = reportedType.trim().toLowerCase();
  if (reported === "image/jpg") return "image/jpeg";
  if (ALLOWED.has(reported)) return reported;
  return null;
}

export function validateImageBytes(bytes: Uint8Array, reportedType = ""): string | null {
  if (bytes.byteLength > MAX_BYTES) {
    return `File too large (max ${Math.round(MAX_BYTES / (1024 * 1024))} MB).`;
  }
  if (!sniffImageMime(bytes, reportedType)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed. On iPhone, choose Most Compatible (JPEG) instead of HEIC.";
  }
  return null;
}

export function assertImageFile(file: File): string | null {
  const reported = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (reported && !ALLOWED.has(reported) && reported !== "application/octet-stream") {
    if (reported === "image/heic" || reported === "image/heif") {
      return "Only JPEG, PNG, WebP, or GIF images are allowed. On iPhone, choose Most Compatible (JPEG) instead of HEIC.";
    }
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
  const buf = Buffer.from(await file.arrayBuffer());
  const err = validateImageBytes(buf, file.type);
  if (err) return { ok: false, error: err };

  const contentType = sniffImageMime(buf, file.type) ?? "application/octet-stream";
  const storedName = buildStoredFilename(file.name);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      const blob = await put(`angies/menu/${storedName}`, buf, {
        access: "public",
        token,
        contentType,
        addRandomSuffix: false,
      });
      return {
        ok: true,
        value: { url: blob.url, filename: storedName },
      };
    } catch (e) {
      console.error("[putPublicImage] Vercel Blob upload failed:", e);
      return {
        ok: false,
        error: `Upload failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      };
    }
  }

  if (process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error:
        "File upload is not configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) for production uploads.",
    };
  }

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
