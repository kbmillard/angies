import postgres from "postgres";

let sqlClient: ReturnType<typeof postgres> | null = null;

/** Shared Postgres pool for catalog + photos (serverless-friendly). */
export function getSql(): ReturnType<typeof postgres> | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!sqlClient) {
    sqlClient = postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 10 });
  }
  return sqlClient;
}
