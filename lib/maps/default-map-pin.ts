/**
 * Default map center when no lat/lng yet — 400 E Linwood Blvd, Kansas City, MO (Angie’s base).
 * Used for embed fallback and KC-anchored search.
 */
export const DEFAULT_MAP_PIN_LAT = 39.05294;
export const DEFAULT_MAP_PIN_LNG = -94.56472;

/** `lat,lng` for Google `center=` / `ll=` query params */
export const DEFAULT_MAP_CENTER_COMMA = `${DEFAULT_MAP_PIN_LAT},${DEFAULT_MAP_PIN_LNG}`;
