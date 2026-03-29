import type {
  CategoryKey,
  CountryData,
  RankedCountry,
  WeightMap,
} from "./types";
import { CATEGORY_KEYS } from "./types";

/**
 * Compute a weighted composite score for a single country.
 *
 * finalScore = Σ(weight_i × score_i) / Σ(weight_i)
 *
 * Categories with null scores are skipped — they do not reduce
 * the denominator, so missing data doesn't unfairly penalise a country.
 */
export function computeScore(
  country: CountryData,
  weights: WeightMap,
): number {
  let numerator = 0;
  let denominator = 0;

  for (const key of CATEGORY_KEYS) {
    const w = weights[key];
    if (w <= 0) continue;

    const score = country.scores[key]?.value;
    if (score === null || score === undefined) continue;

    numerator += w * score;
    denominator += w;
  }

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10) / 10;
}

/**
 * Rank all countries by their weighted composite score.
 * Returns a sorted array with 1-based rank attached.
 */
export function rankCountries(
  countries: CountryData[],
  weights: WeightMap,
): RankedCountry[] {
  const scored = countries.map((country) => ({
    country,
    finalScore: computeScore(country, weights),
    rank: 0,
  }));

  scored.sort((a, b) => b.finalScore - a.finalScore);

  scored.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return scored;
}

/**
 * Default equal weights for all categories.
 */
export function defaultWeights(): WeightMap {
  const w = 50; // default slider position (out of 100)
  return Object.fromEntries(CATEGORY_KEYS.map((k) => [k, w])) as WeightMap;
}

/**
 * Determine a colour class for a 0–100 score value.
 */
export function scoreColour(value: number | null): string {
  if (value === null) return "text-slate-500";
  if (value >= 75) return "text-green-400";
  if (value >= 50) return "text-yellow-400";
  if (value >= 25) return "text-orange-400";
  return "text-red-400";
}

/**
 * Get the short label for a category weight percentage.
 * Accepts independent 0-100 weights (not forced to sum to 100).
 */
export function weightPercent(key: CategoryKey, weights: WeightMap): string {
  const total = (Object.values(weights) as number[]).reduce((s, v) => s + v, 0);
  if (total === 0) return "0%";
  return `${Math.round((weights[key] / total) * 100)}%`;
}
