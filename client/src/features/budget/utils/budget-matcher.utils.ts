import type { CountryData, CostOfLivingData } from "@core/models";
import type { BudgetCategoryWeights, Bedrooms, HousingPreference } from "../store/budget.store";
import type { BudgetBreakdown, BudgetMatch } from "../models/budget-matcher.models";

function scaleForPeople(category: string, base: number, peopleCount: number): number {
  if (peopleCount <= 1) return base;
  switch (category) {
    case "groceries":
      return base * (1 + (peopleCount - 1) * 0.8);
    case "dining":
      return base * peopleCount;
    case "transport":
      return base * (1 + (peopleCount - 1) * 0.6);
    case "utilities":
      return base * (1 + (peopleCount - 1) * 0.12);
    case "coworking":
      return base;
    case "healthInsurance":
      return base * peopleCount;
    default:
      return base * peopleCount;
  }
}

function getRent(
  costOfLiving: CostOfLivingData,
  housing: HousingPreference,
  bedrooms: Bedrooms,
): number | null {
  if (bedrooms === 1) {
    return housing === "majorCity" ? costOfLiving.rentMajorCity : costOfLiving.rentSmallerCity;
  }

  const base = bedrooms === 3 ? costOfLiving.rent3br : costOfLiving.rent2br;
  if (base === null) return null;

  const major = costOfLiving.rentMajorCity;
  const smaller = costOfLiving.rentSmallerCity;
  if (major === null || smaller === null || smaller === 0) return base;

  const avg1BR = (major + smaller) / 2;
  const scaleFactor = housing === "majorCity" ? major / avg1BR : smaller / avg1BR;
  return Math.round(base * scaleFactor);
}

function computeWeightedCost(
  costOfLiving: CostOfLivingData,
  housing: HousingPreference,
  bedrooms: Bedrooms,
  peopleCount: number,
  weights: BudgetCategoryWeights,
): { total: number; breakdown: BudgetBreakdown } | null {
  const rent = getRent(costOfLiving, housing, bedrooms);
  if (
    rent === null ||
    costOfLiving.groceries === null ||
    costOfLiving.transport === null ||
    costOfLiving.utilities === null
  ) {
    return null;
  }

  const people = Math.max(1, peopleCount);
  const raw = {
    housing: rent,
    groceries: scaleForPeople("groceries", costOfLiving.groceries, people),
    dining: scaleForPeople("dining", costOfLiving.dining ?? 0, people),
    transport: scaleForPeople("transport", costOfLiving.transport, people),
    utilities: scaleForPeople("utilities", costOfLiving.utilities, people),
    coworking: scaleForPeople("coworking", costOfLiving.coworking ?? 0, people),
    healthInsurance: scaleForPeople("healthInsurance", costOfLiving.healthInsurance ?? 0, people),
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

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return { total, breakdown };
}

function ratioToScore(ratio: number): number {
  if (ratio <= 0) return 0;
  const raw = 50 + 40 * Math.log2(ratio);
  return Math.max(0, Math.min(99, raw));
}

export function getBudgetMatches(
  countries: CountryData[],
  budget: number,
  housing: HousingPreference,
  bedrooms: Bedrooms,
  peopleCount: number,
  categoryWeights: BudgetCategoryWeights,
  qualityBlend: number,
): BudgetMatch[] {
  if (budget <= 0) return [];

  const results: BudgetMatch[] = [];

  for (const country of countries) {
    const costOfLiving = country.costOfLiving;
    if (!costOfLiving) continue;

    const computed = computeWeightedCost(
      costOfLiving,
      housing,
      bedrooms,
      peopleCount,
      categoryWeights,
    );
    if (!computed || computed.total <= 0) continue;

    const comfortRatio = budget / computed.total;
    let score = ratioToScore(comfortRatio);

    if (qualityBlend > 0) {
      let scoreSum = 0;
      let scoreCount = 0;

      for (const scoreEntry of Object.values(country.scores)) {
        const value = scoreEntry.value;
        if (value === null || value === undefined) continue;
        scoreSum += value;
        scoreCount += 1;
      }

      if (scoreCount > 0) {
        const avgQuality = scoreSum / scoreCount;
        score = score * (1 - qualityBlend / 100) + avgQuality * (qualityBlend / 100);
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
}
