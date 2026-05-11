import { useCallback, useMemo } from "react";
import {
  CATEGORY_WEIGHT_KEYS,
  DEFAULT_BEDROOMS,
  DEFAULT_CATEGORY_WEIGHTS,
  DEFAULT_HOUSING,
  DEFAULT_PEOPLE_COUNT,
  DEFAULT_QUALITY_BLEND,
  isDefaultBudgetPreferences,
  useBudgetPreferenceStore,
} from "../features/budget/model/budget.store";
import type {
  Bedrooms,
  BudgetCategoryWeights,
  BudgetPreferencesState,
  HousingPreference,
} from "../features/budget/model/budget.store";
import { copyTextToClipboard } from "../shared/hooks/useClipboard";

export type { Bedrooms, BudgetCategoryWeights, HousingPreference };

function buildBudgetShareUrl(state: BudgetPreferencesState): string {
  const params = new URLSearchParams();
  params.set("budget", String(state.budget));
  if (state.housing !== DEFAULT_HOUSING) params.set("housing", state.housing);
  if (state.bedrooms !== DEFAULT_BEDROOMS) params.set("bedrooms", String(state.bedrooms));
  if (state.peopleCount !== DEFAULT_PEOPLE_COUNT) params.set("people", String(state.peopleCount));
  if (state.qualityBlend !== DEFAULT_QUALITY_BLEND) {
    params.set("quality", String(state.qualityBlend));
  }

  const nonDefault = CATEGORY_WEIGHT_KEYS.filter(
    (key) => state.categoryWeights[key] !== DEFAULT_CATEGORY_WEIGHTS[key],
  );
  if (nonDefault.length > 0) {
    params.set("cw", nonDefault.map((key) => `${key}:${state.categoryWeights[key]}`).join(","));
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function useBudgetState() {
  const budget = useBudgetPreferenceStore((state) => state.budget);
  const housing = useBudgetPreferenceStore((state) => state.housing);
  const peopleCount = useBudgetPreferenceStore((state) => state.peopleCount);
  const bedrooms = useBudgetPreferenceStore((state) => state.bedrooms);
  const qualityBlend = useBudgetPreferenceStore((state) => state.qualityBlend);
  const categoryWeights = useBudgetPreferenceStore((state) => state.categoryWeights);
  const setBudget = useBudgetPreferenceStore((state) => state.setBudget);
  const setHousing = useBudgetPreferenceStore((state) => state.setHousing);
  const setPeopleCount = useBudgetPreferenceStore((state) => state.setPeopleCount);
  const setBedrooms = useBudgetPreferenceStore((state) => state.setBedrooms);
  const setQualityBlend = useBudgetPreferenceStore((state) => state.setQualityBlend);
  const handleCategoryWeight = useBudgetPreferenceStore((state) => state.handleCategoryWeight);
  const handleReset = useBudgetPreferenceStore((state) => state.handleReset);

  const state = useMemo(
    () => ({
      budget,
      housing,
      peopleCount,
      bedrooms,
      qualityBlend,
      categoryWeights,
    }),
    [budget, housing, peopleCount, bedrooms, qualityBlend, categoryWeights],
  );

  const handleShare = useCallback(() => {
    const url = buildBudgetShareUrl(state);
    void copyTextToClipboard(url).catch((error) => {
      console.error("Failed to copy budget share URL", error);
    });
  }, [state]);

  return {
    ...state,
    setBudget,
    setHousing,
    setPeopleCount,
    setBedrooms,
    setQualityBlend,
    handleCategoryWeight,
    handleReset,
    isDefault: isDefaultBudgetPreferences(state),
    handleShare,
  };
}
