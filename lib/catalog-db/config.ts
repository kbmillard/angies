/** When `database`, menu/locations/schedule read from Postgres when tables have rows (see `SITE_DATA_SOURCE`). */
export function siteCatalogFromDatabase(): boolean {
  return process.env.SITE_DATA_SOURCE?.trim().toLowerCase() === "database";
}
