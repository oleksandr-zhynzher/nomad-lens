import type { CountryData, CostOfLivingData } from "./types";
import { TOURISM_CATEGORY_KEYS } from "./types";
import type {
  AccommodationType,
  DiningPreference,
  TourismBudgetState,
  TravelDates,
} from "../hooks/useTourismWeightState";

export type TourismWeightMap = Record<string, number>;

export interface TourismRanked {
  country: CountryData;
  tourismScore: number;
  rank: number;
  budgetMatch?: TourismBudgetMatch;
}

/** Fixed-weight average of the 6 tourism category scores. */
export function computeTourismScore(country: CountryData): number | null {
  let sum = 0;
  let count = 0;
  for (const key of TOURISM_CATEGORY_KEYS) {
    const v = country.scores[key]?.value;
    if (v != null) {
      sum += v;
      count++;
    }
  }
  return count >= 3 ? Math.round((sum / count) * 10) / 10 : null;
}

/**
 * Compute which months (0-11) a date range covers and the weight of each.
 * Returns a map of month index → fraction of days in that month.
 */
function getMonthWeights(
  startDate: string,
  endDate: string,
): Map<number, number> {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start)
    return new Map();

  const weights = new Map<number, number>();
  let totalDays = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const month = cursor.getMonth();
    weights.set(month, (weights.get(month) ?? 0) + 1);
    totalDays++;
    cursor.setDate(cursor.getDate() + 1);
  }
  // Normalize to fractions
  for (const [m, days] of weights) {
    weights.set(m, days / totalDays);
  }
  return weights;
}

/**
 * Get the seasonal multiplier (0-1) for a tag given a date range.
 * Averages the monthly seasonality scores weighted by how many days fall in each month.
 */
function getSeasonalMultiplier(
  country: CountryData,
  tag: string,
  monthWeights: Map<number, number>,
): number {
  const seasonality = country.tourismTagSeasonality?.[tag];
  if (!seasonality || seasonality.length !== 12) return 1;
  let total = 0;
  for (const [month, weight] of monthWeights) {
    total += (seasonality[month] / 100) * weight;
  }
  return total;
}

/**
 * Weighted tourism score using user-defined weights per metric.
 *
 * finalScore = Σ(weight_i × score_i) / Σ(weight_i)  −  (missingActiveMetrics × 2)
 *
 * Metrics with null scores are skipped from the weighted average but apply
 * a −2 pt penalty each, so countries with sparse data rank lower than
 * data-rich countries with similar weighted averages.
 */
export function computeWeightedTourismScore(
  country: CountryData,
  weights: TourismWeightMap,
  selectedTags?: string[],
  travelDates?: TravelDates,
  activityBlend?: number,
): number {
  let numerator = 0;
  let denominator = 0;
  let missingCount = 0;
  for (const key of TOURISM_CATEGORY_KEYS) {
    const w = weights[key] ?? 0;
    if (w <= 0) continue;
    const val = country.scores[key]?.value;
    if (val === null || val === undefined) {
      missingCount++;
      continue;
    }
    numerator += w * val;
    denominator += w;
  }

  // Include selected tag quality scores as additional weighted dimensions
  if (selectedTags && selectedTags.length > 0) {
    // Scale tag weight by activityBlend: 0 = tags don't matter, 100 = tags dominate
    const blend = activityBlend ?? 50;
    const tagWeight = blend;
    const monthWeights =
      travelDates?.startDate && travelDates?.endDate
        ? getMonthWeights(travelDates.startDate, travelDates.endDate)
        : null;

    for (const tag of selectedTags) {
      let tagScore = country.tourismTagScores?.[tag] ?? null;
      if (tagScore != null) {
        // Apply seasonal multiplier when travel dates are set
        if (monthWeights && monthWeights.size > 0) {
          tagScore =
            tagScore * getSeasonalMultiplier(country, tag, monthWeights);
        }
        numerator += tagWeight * tagScore;
        denominator += tagWeight;
      } else {
        missingCount++;
      }
    }
  }

  if (denominator === 0) return 0;
  const base = numerator / denominator - missingCount * 2;
  return Math.round(Math.max(0, base) * 10) / 10;
}

/** Rank countries by composite tourism score, filtering out nulls. */
export function getTourismRanking(countries: CountryData[]): TourismRanked[] {
  const scored = countries
    .map((c) => ({ country: c, tourismScore: computeTourismScore(c) }))
    .filter(
      (x): x is { country: CountryData; tourismScore: number } =>
        x.tourismScore != null,
    );

  scored.sort((a, b) => b.tourismScore - a.tourismScore);

  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}

/** Rank countries using user-defined tourism weights. */
export function getWeightedTourismRanking(
  countries: CountryData[],
  weights: TourismWeightMap,
  selectedTags?: string[],
  travelDates?: TravelDates,
  activityBlend?: number,
): TourismRanked[] {
  const activeKeys = TOURISM_CATEGORY_KEYS.filter((k) => (weights[k] ?? 0) > 0);
  const totalActive = activeKeys.length;

  const scored = countries
    .map((c) => {
      const presentCount = activeKeys.filter(
        (k) => c.scores[k]?.value != null,
      ).length;
      return {
        country: c,
        tourismScore: computeWeightedTourismScore(
          c,
          weights,
          selectedTags,
          travelDates,
          activityBlend,
        ),
        presentCount,
      };
    })
    .filter((x) => x.tourismScore > 0);

  // Primary: countries with all active metrics first
  // Secondary: higher score first
  scored.sort((a, b) => {
    const aComplete = a.presentCount === totalActive ? 1 : 0;
    const bComplete = b.presentCount === totalActive ? 1 : 0;
    if (aComplete !== bComplete) return bComplete - aComplete;
    return b.tourismScore - a.tourismScore;
  });

  return scored.map((s, i) => ({
    country: s.country,
    tourismScore: s.tourismScore,
    rank: i + 1,
  }));
}

export function tourismScoreColour(score: number): string {
  if (score >= 70) return "#4CAF50";
  if (score >= 55) return "#8BC34A";
  if (score >= 40) return "#FFC107";
  return "#FF5722";
}

export function defaultTourismWeights(): TourismWeightMap {
  return Object.fromEntries(TOURISM_CATEGORY_KEYS.map((k) => [k, 50]));
}

// ─── Tourism Budget Scoring ────────────────────────────────────────────────────

export interface TourismBudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
}

export interface TourismBudgetMatch {
  country: CountryData;
  tourismScore: number;
  budgetScore: number; // 0-99, pure affordability
  blendedScore: number; // tourism × budget blend
  dailyCost: number;
  surplus: number; // dailyBudget - dailyCost
  breakdown: TourismBudgetBreakdown;
  rank: number;
}

/**
 * Estimate a daily accommodation cost from the monthly cost-of-living data.
 * Different accommodation types use different multipliers on the rental data.
 */
function getAccommodationDaily(
  col: CostOfLivingData,
  type: AccommodationType,
): number | null {
  // Use smaller city rent as baseline for tourist accommodation
  const monthlyRent = col.rentSmallerCity ?? col.rentMajorCity;
  if (monthlyRent == null) return null;

  const dailyRent = monthlyRent / 30;

  switch (type) {
    case "hotel5":
      return dailyRent * 5.0;
    case "hotel4":
      return dailyRent * 3.5;
    case "hotel3":
      return dailyRent * 2.5;
    case "hotel2":
      return dailyRent * 1.8;
    case "hotel1":
      return dailyRent * 1.2;
    case "hostel":
      return dailyRent * 0.4;
    case "airbnb":
      return dailyRent * 1.5;
  }
}

/**
 * Compute daily food cost based on dining preference.
 * Uses per-meal cost data (mealBudget / mealMidRange) sourced from Numbeo.
 * - market: self-catering from groceries (cheapest)
 * - casual: 3 meals/day at budget/inexpensive restaurants
 * - restaurants: 3 meals/day at mid-range restaurants
 */
function getFoodDaily(
  col: CostOfLivingData,
  dining: DiningPreference,
): number | null {
  switch (dining) {
    case "market":
      // Self-catering: groceries only, per day
      if (col.groceries == null) return null;
      return col.groceries / 30;
    case "casual":
      // 3 budget restaurant meals per day
      if (col.mealBudget != null) return col.mealBudget * 3;
      // Fallback: derive from groceries
      if (col.groceries != null) return (col.groceries / 30) * 2.5;
      return null;
    case "restaurants":
      // 3 mid-range restaurant meals per day
      if (col.mealMidRange != null) return col.mealMidRange * 3;
      // Fallback: derive from mealBudget or groceries
      if (col.mealBudget != null) return col.mealBudget * 3 * 2.2;
      if (col.groceries != null) return (col.groceries / 30) * 5;
      return null;
  }
}

/**
 * Compute daily tourism cost breakdown for a country.
 */
function computeTourismDailyCost(
  col: CostOfLivingData,
  accommodation: AccommodationType,
  dining: DiningPreference,
  peopleCount: number,
): { total: number; breakdown: TourismBudgetBreakdown } | null {
  const accomDaily = getAccommodationDaily(col, accommodation);
  if (accomDaily == null) return null;

  const n = Math.max(1, peopleCount);

  // Food: based on dining preference, scaled linearly per person
  const foodPerPerson = getFoodDaily(col, dining);
  if (foodPerPerson == null) return null;
  const foodDaily = foodPerPerson * n;

  // Activities: estimate as 30% of accommodation cost per person
  const activitiesDaily = accomDaily * 0.3 * n;

  // Accommodation: per-room for hotel/hostel, scale for larger groups
  const accomScaled =
    accommodation === "hostel"
      ? accomDaily * n // per-bed pricing
      : accomDaily * Math.ceil(n / 2); // ~1 room per 2 people

  const breakdown: TourismBudgetBreakdown = {
    accommodation: Math.round(accomScaled * 100) / 100,
    food: Math.round(foodDaily * 100) / 100,
    activities: Math.round(activitiesDaily * 100) / 100,
  };

  const total = breakdown.accommodation + breakdown.food + breakdown.activities;
  return { total: Math.round(total * 100) / 100, breakdown };
}

/**
 * Logarithmic ratio-to-score: ratio 1.0 → 50, 2.0 → 90, 0.5 → 10
 */
function budgetRatioToScore(ratio: number): number {
  if (ratio <= 0) return 0;
  const raw = 50 + 40 * Math.log2(ratio);
  return Math.max(0, Math.min(99, raw));
}

/**
 * Rank countries by blended tourism + budget score.
 */
export function getWeightedTourismBudgetRanking(
  countries: CountryData[],
  weights: TourismWeightMap,
  budget: TourismBudgetState,
  selectedTags?: string[],
  travelDates?: TravelDates,
  activityBlend?: number,
): TourismBudgetMatch[] {
  const results: TourismBudgetMatch[] = [];

  for (const country of countries) {
    const tourismScore = computeWeightedTourismScore(
      country,
      weights,
      selectedTags,
      travelDates,
      activityBlend,
    );
    if (tourismScore <= 0) continue;

    const col = country.costOfLiving;
    if (!col) continue;

    const computed = computeTourismDailyCost(
      col,
      budget.accommodation,
      budget.dining,
      budget.peopleCount,
    );
    if (!computed || computed.total <= 0) continue;

    const ratio = budget.dailyBudget / computed.total;
    const budgetScore = budgetRatioToScore(ratio);

    // Blend: budgetBlend=0 → pure affordability, budgetBlend=100 → pure tourism quality
    const blendFactor = (100 - budget.budgetBlend) / 100;
    const blendedScore =
      tourismScore * (1 - blendFactor) + budgetScore * blendFactor;

    results.push({
      country,
      tourismScore: Math.round(tourismScore * 10) / 10,
      budgetScore: Math.round(budgetScore * 10) / 10,
      blendedScore: Math.round(blendedScore * 10) / 10,
      dailyCost: Math.round(computed.total),
      surplus: Math.round(budget.dailyBudget - computed.total),
      breakdown: {
        accommodation: Math.round(computed.breakdown.accommodation),
        food: Math.round(computed.breakdown.food),
        activities: Math.round(computed.breakdown.activities),
      },
      rank: 0,
    });
  }

  results.sort((a, b) => b.blendedScore - a.blendedScore);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return results;
}
