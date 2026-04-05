import { useMemo } from "react";
import type { CountryData, CostOfLivingData } from "../utils/types";
import type {
  BudgetCategoryWeights,
  Bedrooms,
  HousingPreference,
} from "./useBudgetState";

export interface BudgetBreakdown {
  housing: number;
  groceries: number;
  dining: number;
  transport: number;
  utilities: number;
  coworking: number;
  healthInsurance: number;
}

export interface BudgetMatch {
  country: CountryData;
  comfortScore: number;
  monthlyCost: number;
  surplus: number;
  breakdown: BudgetBreakdown;
}

// Per-person scaling formulas (n = number of people)
// Each extra person adds a fraction of the base cost
function scaleForPeople(category: string, base: number, n: number): number {
  if (n <= 1) return base;
  switch (category) {
    case "groceries":
      return base * (1 + (n - 1) * 0.8); // sub-linear
    case "dining":
      return base * n; // linear
    case "transport":
      return base * (1 + (n - 1) * 0.6); // sub-linear
    case "utilities":
      return base * (1 + (n - 1) * 0.12); // near-fixed
    case "coworking":
      return base; // always 1
    case "healthInsurance":
      return base * n; // linear
    default:
      return base * n;
  }
}

function getRent(
  col: CostOfLivingData,
  housing: HousingPreference,
  bedrooms: Bedrooms,
): number | null {
  if (bedrooms === 1) {
    return housing === "majorCity" ? col.rentMajorCity : col.rentSmallerCity;
  }

  // For 2BR/3BR we have a national average — split it using the 1BR major/smaller ratio
  const base = bedrooms === 3 ? col.rent3br : col.rent2br;
  if (base === null) return null;

  const major = col.rentMajorCity;
  const smaller = col.rentSmallerCity;
  if (major === null || smaller === null || smaller === 0) return base;

  const avg1BR = (major + smaller) / 2;
  const scaleFactor =
    housing === "majorCity" ? major / avg1BR : smaller / avg1BR;
  return Math.round(base * scaleFactor);
}

function computeWeightedCost(
  col: CostOfLivingData,
  housing: HousingPreference,
  bedrooms: Bedrooms,
  peopleCount: number,
  weights: BudgetCategoryWeights,
): { total: number; breakdown: BudgetBreakdown } | null {
  const rent = getRent(col, housing, bedrooms);
  if (
    rent === null ||
    col.groceries === null ||
    col.transport === null ||
    col.utilities === null
  )
    return null;

  const n = Math.max(1, peopleCount);
  const raw = {
    housing: rent,
    groceries: scaleForPeople("groceries", col.groceries, n),
    dining: scaleForPeople("dining", col.dining ?? 0, n),
    transport: scaleForPeople("transport", col.transport, n),
    utilities: scaleForPeople("utilities", col.utilities, n),
    coworking: scaleForPeople("coworking", col.coworking ?? 0, n),
    healthInsurance: scaleForPeople(
      "healthInsurance",
      col.healthInsurance ?? 0,
      n,
    ),
  };

  const breakdown: BudgetBreakdown = {
    housing: raw.housing * (weights.housing / 100),
    groceries: raw.groceries * (weights.groceries / 100),
    dining: raw.dining * (weights.dining / 100),
    transport: raw.transport * (weights.transport / 100),
    utilities: raw.utilities * (weights.utilities / 100),
    coworking: raw.coworking * (weights.coworking / 100),
    healthInsurance: raw.healthInsurance * (weights.healthInsurance / 100),
  };

  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return { total, breakdown };
}

function ratioToScore(ratio: number): number {
  if (ratio <= 0) return 0;
  // Logarithmic: ratio 1.0 → 50, 2.0 → 90, 0.5 → 10
  const raw = 50 + 40 * Math.log2(ratio);
  return Math.max(0, Math.min(99, raw));
}

export function useBudgetMatcher(
  countries: CountryData[],
  budget: number,
  housing: HousingPreference,
  bedrooms: Bedrooms,
  peopleCount: number,
  categoryWeights: BudgetCategoryWeights,
  qualityBlend: number,
): BudgetMatch[] {
  return useMemo(() => {
    if (budget <= 0) return [];

    const results: BudgetMatch[] = [];

    for (const country of countries) {
      const col = country.costOfLiving;
      if (!col) continue;

      const computed = computeWeightedCost(
        col,
        housing,
        bedrooms,
        peopleCount,
        categoryWeights,
      );
      if (!computed || computed.total <= 0) continue;

      const comfortRatio = budget / computed.total;
      let score = ratioToScore(comfortRatio);

      // Quality blend: mix with average country quality score
      if (qualityBlend > 0) {
        const scoreValues = Object.values(country.scores)
          .map((s) => s.value)
          .filter((v): v is number => v !== null && v !== undefined);
        if (scoreValues.length > 0) {
          const avgQuality =
            scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
          score =
            score * (1 - qualityBlend / 100) +
            avgQuality * (qualityBlend / 100);
        }
      }

      results.push({
        country,
        comfortScore: Math.round(score * 10) / 10,
        monthlyCost: Math.round(computed.total),
        surplus: Math.round(budget - computed.total),
        breakdown: {
          housing: Math.round(computed.breakdown.housing),
          groceries: Math.round(computed.breakdown.groceries),
          dining: Math.round(computed.breakdown.dining),
          transport: Math.round(computed.breakdown.transport),
          utilities: Math.round(computed.breakdown.utilities),
          coworking: Math.round(computed.breakdown.coworking),
          healthInsurance: Math.round(computed.breakdown.healthInsurance),
        },
      });
    }

    results.sort((a, b) => b.comfortScore - a.comfortScore);
    return results;
  }, [
    countries,
    budget,
    housing,
    bedrooms,
    peopleCount,
    categoryWeights,
    qualityBlend,
  ]);
}
