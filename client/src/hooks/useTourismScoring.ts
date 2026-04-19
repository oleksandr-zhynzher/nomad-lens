import { useMemo } from "react";
import type { CountryData } from "../utils/types";
import type { TourismRanked, TourismWeightMap } from "../utils/tourismScoring";
import {
  getWeightedTourismRanking,
  getWeightedTourismBudgetRanking,
} from "../utils/tourismScoring";
import type {
  TourismToggles,
  TourismBudgetState,
  TravelDates,
} from "./useTourismWeightState";

export type { TourismBudgetMatch } from "../utils/tourismScoring";

export function useTourismScoring(
  countries: CountryData[],
  weights: TourismWeightMap,
  regionFilter: Set<string>,
  toggles?: TourismToggles,
  budgetState?: TourismBudgetState,
  travelDates?: TravelDates,
): TourismRanked[] {
  return useMemo(() => {
    let filtered = countries.filter(
      (c) => regionFilter.size === 0 || regionFilter.has(c.region),
    );

    if (toggles) {
      if (toggles.visaFreeOnly) {
        filtered = filtered.filter(
          (c) => c.touristVisaDays != null && c.touristVisaDays > 0,
        );
      }
      if (toggles.requiredTags.length > 0) {
        filtered = filtered.filter((c) => {
          const tags = c.tourismTags ?? [];
          return toggles.requiredTags.every((t) => tags.includes(t));
        });
      }
    }

    const selectedTags = toggles?.requiredTags ?? [];
    const activeTags = selectedTags.length > 0 ? selectedTags : undefined;
    const activeDates =
      travelDates?.startDate && travelDates?.endDate ? travelDates : undefined;
    const activityBlend = toggles?.activityBlend;

    // When budget is enabled, use budget-blended ranking
    if (budgetState?.budgetEnabled) {
      const budgetResults = getWeightedTourismBudgetRanking(
        filtered,
        weights,
        budgetState,
        activeTags,
        activeDates,
        activityBlend,
      );
      return budgetResults.map((r) => ({
        country: r.country,
        tourismScore: r.blendedScore,
        rank: r.rank,
        budgetMatch: r,
      }));
    }

    return getWeightedTourismRanking(
      filtered,
      weights,
      activeTags,
      activeDates,
      activityBlend,
    );
  }, [countries, weights, regionFilter, toggles, budgetState, travelDates]);
}
