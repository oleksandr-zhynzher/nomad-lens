import { useMemo } from "react";
import type { CountryData } from "@core/models";
import { getBudgetMatches } from "@features/budget/utils";
import type { BudgetMatch } from "../models/budget-matcher.models";
import type { BudgetCategoryWeights, Bedrooms, HousingPreference } from "./useBudgetState";

export type { BudgetBreakdown, BudgetMatch } from "../models/budget-matcher.models";

export function useBudgetMatcher(
  countries: CountryData[],
  budget: number,
  housing: HousingPreference,
  bedrooms: Bedrooms,
  peopleCount: number,
  categoryWeights: BudgetCategoryWeights,
  qualityBlend: number,
): BudgetMatch[] {
  return useMemo(
    () =>
      getBudgetMatches(
        countries,
        budget,
        housing,
        bedrooms,
        peopleCount,
        categoryWeights,
        qualityBlend,
      ),
    [countries, budget, housing, bedrooms, peopleCount, categoryWeights, qualityBlend],
  );
}
