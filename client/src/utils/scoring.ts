import type {
  CategoryKey,
  ClimateData,
  ClimatePreferences,
  CountryData,
  RankedCountry,
  SeasonType,
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
 * Determine a colour for a 0–100 score value.
 * Returns hex color string for the 4-tier system.
 */
export function scoreColour(value: number | null): string {
  if (value === null) return "#3A3A3A";
  if (value >= 75) return "#4CAF50"; // Excellent - green
  if (value >= 60) return "#8BC34A"; // Good - light green
  if (value >= 50) return "#FFC107"; // Moderate - amber
  return "#FF5722"; // Low - red-orange
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

// ─── Climate Preferences Scoring ──────────────────────────────────────────────

const ADJACENT: Record<SeasonType, SeasonType[]> = {
  four_seasons: ['mild_seasons'],
  mild_seasons: ['four_seasons', 'tropical'],
  tropical: ['mild_seasons', 'arid'],
  arid: ['tropical'],
  polar: ['four_seasons'],
};

/**
 * Compute a preference-based climate score (0–100).
 * 70% temperature match + 30% season type match.
 */
export function computeClimateScore(
  climateData: ClimateData,
  prefs: ClimatePreferences,
): number {
  const { annualMeanTemp, seasonType } = climateData;

  let tempScore: number;
  if (annualMeanTemp >= prefs.minTemp && annualMeanTemp <= prefs.maxTemp) {
    tempScore = 100;
  } else {
    const dev = Math.min(
      Math.abs(annualMeanTemp - prefs.minTemp),
      Math.abs(annualMeanTemp - prefs.maxTemp),
    );
    tempScore = Math.max(0, 100 - dev * 5);
  }

  let seasonScore: number;
  if (prefs.seasonType === 'any') {
    seasonScore = 100;
  } else if (prefs.seasonType === seasonType) {
    seasonScore = 100;
  } else if (ADJACENT[prefs.seasonType as SeasonType]?.includes(seasonType)) {
    seasonScore = 60;
  } else {
    seasonScore = 20;
  }

  return Math.round((tempScore * 0.7 + seasonScore * 0.3) * 10) / 10;
}

export function defaultClimatePreferences(): ClimatePreferences {
  return { seasonType: 'any', minTemp: 15, maxTemp: 25 };
}
