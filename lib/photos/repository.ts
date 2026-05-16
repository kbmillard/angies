import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSql } from "@/lib/db/sql";
import type { PhotoRecord, PhotoRepository } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const JSON_STORE = path.join(DATA_DIR, "photos.json");

function mapRow(r: {
  id: string;
  url: string;
  filename: string;
  alt_text: string;
  category: string;
  created_at: Date | string;
}): PhotoRecord {
  return {
    id: r.id,
    url: r.url,
    filename: r.filename,
    alt_text: r.alt_text,
    category: r.category,
    created_at:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
  };
}

let photosTableReady = false;

async function ensurePhotosTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  if (photosTableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      filename TEXT NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  photosTableReady = true;
}

function createPostgresRepository(sql: NonNullable<ReturnType<typeof getSql>>): PhotoRepository {
  return {
    async list() {
      await ensurePhotosTable(sql);
      const rows = await sql<
        {
          id: string;
          url: string;
          filename: string;
          alt_text: string;
          category: string;
          created_at: Date;
        }[]
      >`SELECT id, url, filename, alt_text, category, created_at FROM photos ORDER BY created_at DESC`;
      return rows.map(mapRow);
    },
    async create(input) {
      await ensurePhotosTable(sql);
      const rows = await sql<
        {
          id: string;
          url: string;
          filename: string;
          alt_text: string;
          category: string;
          created_at: Date;
        }[]
      >`
        INSERT INTO photos (id, url, filename, alt_text, category)
        VALUES (
          ${input.id},
          ${input.url},
          ${input.filename},
          ${input.alt_text},
          ${input.category}
        )
        RETURNING id, url, filename, alt_text, category, created_at
      `;
      return mapRow(rows[0]!);
    },
    async update(id, patch) {
      await ensurePhotosTable(sql);
      const existing = await sql<
        {
          id: string;
          url: string;
          filename: string;
          alt_text: string;
          category: string;
          created_at: Date;
        }[]
      >`
        SELECT id, url, filename, alt_text, category, created_at
        FROM photos
        WHERE id = ${id}
      `;
      const row = existing[0];
      if (!row) return null;
      const alt_text = patch.alt_text !== undefined ? patch.alt_text : row.alt_text;
      const category = patch.category !== undefined ? patch.category : row.category;
      const out = await sql<
        {
          id: string;
          url: string;
          filename: string;
          alt_text: string;
          category: string;
          created_at: Date;
        }[]
      >`
        UPDATE photos
        SET alt_text = ${alt_text}, category = ${category}
        WHERE id = ${id}
        RETURNING id, url, filename, alt_text, category, created_at
      `;
      return out[0] ? mapRow(out[0]) : null;
    },
  };
}

async function readJsonStore(): Promise<PhotoRecord[]> {
  try {
    const raw = await readFile(JSON_STORE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is PhotoRecord =>
        !!x &&
        typeof x === "object" &&
        typeof (x as PhotoRecord).id === "string" &&
        typeof (x as PhotoRecord).url === "string",
    );
  } catch {
    return [];
  }
}

async function writeJsonStore(rows: PhotoRecord[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(JSON_STORE, JSON.stringify(rows, null, 2), "utf8");
}

function createFileRepository(): PhotoRepository {
  return {
    async list() {
      return readJsonStore();
    },
    async create(input) {
      const all = await readJsonStore();
      const rec: PhotoRecord = {
        id: input.id,
        url: input.url,
        filename: input.filename,
        alt_text: input.alt_text,
        category: input.category,
        created_at: input.created_at ?? new Date().toISOString(),
      };
      all.unshift(rec);
      await writeJsonStore(all);
      return rec;
    },
    async update(id, patch) {
      const all = await readJsonStore();
      const i = all.findIndex((p) => p.id === id);
      if (i < 0) return null;
      const next = {
        ...all[i]!,
        ...(patch.alt_text !== undefined ? { alt_text: patch.alt_text } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
      };
      const copy = [...all];
      copy[i] = next;
      await writeJsonStore(copy);
      return next;
    },
  };
}

/** Postgres when `DATABASE_URL` is set; otherwise JSON file under `.data/photos.json`. */
export function getPhotoRepository(): PhotoRepository {
  const pg = getSql();
  if (pg) return createPostgresRepository(pg);
  return createFileRepository();
}

/** `postgres` when `DATABASE_URL` is set; otherwise local `.data/photos.json` (ephemeral on serverless). */
export function getPhotoMetadataMode(): "postgres" | "local-json" {
  return getSql() ? "postgres" : "local-json";
}
