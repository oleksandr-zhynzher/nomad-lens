import type {
  ClimateData,
  ClimatePreferences,
  CountryData,
  SeasonType,
  WeightMap,
} from "@core/models";
import { CATEGORY_KEYS } from "@core/models";

/**
 * Compute a weighted composite score for a single country.
 *
 * finalScore = Σ(weight_i × score_i) / Σ(weight_i)  −  (missingActiveCategories × 2)
 *
 * Categories with null scores are skipped from the weighted average but apply
 * a −2 pt penalty each, so countries with sparse data rank lower than data-rich
 * countries with similar weighted averages.
 */
export function computeScore(country: CountryData, weights: WeightMap): number {
  let numerator = 0;
  let denominator = 0;
  let missingCount = 0;

  for (const key of CATEGORY_KEYS) {
    const w = weights[key];
    if (w <= 0) continue;

    const score = country.scores[key].value;
    if (score == null) {
      missingCount++;
      continue;
    }

    numerator += w * score;
    denominator += w;
  }

  if (denominator === 0) return 0;
  const base = numerator / denominator - missingCount * 2;
  return Math.round(Math.max(0, base) * 10) / 10;
}

// ─── Climate Preferences Scoring ──────────────────────────────────────────────

const ADJACENT: Record<SeasonType, SeasonType[]> = {
  four_seasons: ["mild_seasons"],
  mild_seasons: ["four_seasons", "tropical"],
  tropical: ["mild_seasons", "arid"],
  arid: ["tropical"],
  polar: ["four_seasons"],
};

/**
 * Compute a preference-based climate score (0–100).
 * 70% temperature match + 30% season type match.
 */
function computeClimateScore(climateData: ClimateData, prefs: ClimatePreferences): number {
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
  if (prefs.seasonType === "any") {
    seasonScore = 100;
  } else if (prefs.seasonType === seasonType) {
    seasonScore = 100;
  } else if (ADJACENT[prefs.seasonType].includes(seasonType)) {
    seasonScore = 60;
  } else {
    seasonScore = 20;
  }

  return Math.round((tempScore * 0.7 + seasonScore * 0.3) * 10) / 10;
}

/** Apply climate preferences to a country's climate score (immutably). */
export function applyClimate(country: CountryData, climatePrefs: ClimatePreferences): CountryData {
  if (!country.climateData) return country;
  return {
    ...country,
    scores: {
      ...country.scores,
      climate: {
        ...country.scores.climate,
        value: computeClimateScore(country.climateData, climatePrefs),
      },
    },
  };
}
