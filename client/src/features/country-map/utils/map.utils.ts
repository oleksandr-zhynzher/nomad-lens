import { isoNumericToAlpha2 } from "@features/country-map/utils";

/**
 * Convert a react-simple-maps geography object to an ISO 3166-1 alpha-2 code.
 * The geography's `id` is expected to be an ISO 3166-1 numeric code.
 */
export function geoNumericToAlpha2(geo: {
  id?: unknown;
  properties: Record<string, unknown>;
}): string {
  const numeric = String(geo.id ?? "").padStart(3, "0");
  return isoNumericToAlpha2[numeric] ?? "";
}

/**
 * Map a final score value to a choropleth fill colour.
 *
 * - ≥ 75 → green  (#4CAF50)
 * - ≥ 50 → amber  (#FFC107)
 * -  < 50 → red-orange (#FF5722)
 * - undefined/null → no-data grey (#3A3A3A)
 */
export function mapScoreToColour(score: number | undefined): string {
  if (score == null) return "#3A3A3A";
  if (score >= 75) return "#4CAF50";
  if (score >= 50) return "#FFC107";
  return "#FF5722";
}
