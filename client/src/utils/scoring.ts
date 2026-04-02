import type {
  CategoryKey,
  ClimateData,
  ClimatePreferences,
  CountryData,
  RankedCountry,
  SeasonType,
  WeightMap,
} from "./types";
import { CATEGORY_KEYS, HIDDEN_CATEGORIES, VISIBLE_CATEGORY_KEYS } from "./types";

/**
 * Compute a weighted composite score for a single country.
 *
 * finalScore = Σ(weight_i × score_i) / Σ(weight_i)  −  (missingActiveCategories × 2)
 *
 * Categories with null scores are skipped from the weighted average but apply
 * a −2 pt penalty each, so countries with sparse data rank lower than data-rich
 * countries with similar weighted averages.
 */
export function computeScore(
  country: CountryData,
  weights: WeightMap,
): number {
  let numerator = 0;
  let denominator = 0;
  let missingCount = 0;

  for (const key of CATEGORY_KEYS) {
    const w = weights[key];
    if (w <= 0) continue;

    const score = country.scores[key]?.value;
    if (score === null || score === undefined) {
      missingCount++;
      continue;
    }

    numerator += w * score;
    denominator += w;
  }

  if (denominator === 0) return 0;
  const base = (numerator / denominator) - (missingCount * 2);
  return Math.round(Math.max(0, base) * 10) / 10;
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
 * Default equal weights for all visible categories, summing to exactly 100.
 */
export function defaultWeights(): WeightMap {
  const visible = VISIBLE_CATEGORY_KEYS;
  const base = Math.floor(100 / visible.length);
  const leftover = 100 - base * visible.length;
  const result = Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 0])) as WeightMap;
  visible.forEach((k, i) => {
    result[k] = base + (i < leftover ? 1 : 0);
  });
  return result;
}

/**
 * Redistribute weights so all visible categories sum to exactly 100,
 * after the user changes one slider to a new value.
 * Others are scaled proportionally using the largest-remainder method.
 */
export function redistributeWeights(
  changedKey: CategoryKey,
  newValue: number,
  weights: WeightMap,
): WeightMap {
  const clamped = Math.max(0, Math.min(100, Math.round(newValue)));
  const result = { ...weights, [changedKey]: clamped };
  const others = VISIBLE_CATEGORY_KEYS.filter((k) => k !== changedKey);
  const remaining = 100 - clamped;

  if (others.length === 0) return result;

  if (remaining === 0) {
    others.forEach((k) => { result[k] = 0; });
    return result;
  }

  const currentOthersSum = others.reduce((s, k) => s + weights[k], 0);
  const freed = remaining - currentOthersSum; // positive = freed, negative = taken

  let exactShares: number[];
  if (freed >= 0) {
    // Decreasing: spread the freed budget equally across every other slider
    const equalDelta = freed / others.length;
    exactShares = others.map((k) => weights[k] + equalDelta);
  } else {
    // Increasing: take proportionally from others (biggest give back the most)
    exactShares = others.map((k) =>
      currentOthersSum > 0
        ? (weights[k] / currentOthersSum) * remaining
        : remaining / others.length,
    );
  }

  // Largest-remainder method for integer allocation
  const floors = exactShares.map((s) => Math.floor(s));
  const floorSum = floors.reduce((a, b) => a + b, 0);
  let leftover = remaining - floorSum;
  const remainders = exactShares.map((s, i) => ({ i, r: s - floors[i] }));
  remainders.sort((a, b) => b.r - a.r);
  remainders.forEach(({ i }) => {
    if (leftover > 0) { floors[i]++; leftover--; }
  });

  others.forEach((k, i) => { result[k] = floors[i]; });
  return result;
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

/**
 * Return a human-readable label for a slider value.
 * Shows "Off" when weight is 0, otherwise the percentage contribution.
 */
export function weightLabel(key: CategoryKey, weights: WeightMap): string {
  const v = weights[key];
  if (v === 0) return "Off";
  return `${v}%`;
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
