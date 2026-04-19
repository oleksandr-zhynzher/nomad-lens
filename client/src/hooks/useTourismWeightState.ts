import { useCallback, useEffect, useMemo, useState } from "react";
import { TOURISM_CATEGORY_KEYS } from "../utils/types";
import type { TourismWeightMap } from "../utils/tourismScoring";
import { defaultTourismWeights } from "../utils/tourismScoring";

const LS_WEIGHTS_KEY = "tourism-weights";
const LS_REGIONS_KEY = "tourism-regions";
const LS_TOGGLES_KEY = "tourism-toggles";
const LS_BUDGET_KEY = "tourism-budget";
const LS_DATES_KEY = "tourism-dates";

export type TourismTag =
  | "beach"
  | "island"
  | "ski"
  | "mountains"
  | "historic"
  | "wildlife"
  | "diving"
  | "desert";

export const ALL_TOURISM_TAGS: TourismTag[] = [
  "beach",
  "island",
  "ski",
  "mountains",
  "historic",
  "wildlife",
  "diving",
  "desert",
];

export interface TourismToggles {
  visaFreeOnly: boolean;
  requiredTags: TourismTag[];
  activityBlend: number; // 0-100: 0 = pure tourism metrics, 100 = pure activity quality
}

export type AccommodationType =
  | "hotel5"
  | "hotel4"
  | "hotel3"
  | "hotel2"
  | "hotel1"
  | "hostel"
  | "airbnb";

export type DiningPreference = "market" | "casual" | "restaurants";

export interface TourismBudgetState {
  dailyBudget: number;
  accommodation: AccommodationType;
  dining: DiningPreference;
  peopleCount: number;
  budgetBlend: number; // 0-100: 0 = pure tourism score, 100 = pure affordability
  budgetEnabled: boolean;
}

const DEFAULT_BUDGET_STATE: TourismBudgetState = {
  dailyBudget: 100,
  accommodation: "hotel3",
  dining: "casual",
  peopleCount: 1,
  budgetBlend: 60,
  budgetEnabled: true,
};

const DEFAULT_TOGGLES: TourismToggles = {
  visaFreeOnly: false,
  requiredTags: [],
  activityBlend: 50,
};

export interface TravelDates {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;
}

const DEFAULT_TRAVEL_DATES: TravelDates = {
  startDate: null,
  endDate: null,
};

export function useTourismWeightState() {
  const [weights, setWeights] = useState<TourismWeightMap>(() => {
    try {
      const stored = localStorage.getItem(LS_WEIGHTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return defaultTourismWeights();
  });

  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(LS_REGIONS_KEY);
      if (stored) return new Set(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    return new Set();
  });

  const [toggles, setToggles] = useState<TourismToggles>(() => {
    try {
      const stored = localStorage.getItem(LS_TOGGLES_KEY);
      if (stored) return { ...DEFAULT_TOGGLES, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return DEFAULT_TOGGLES;
  });

  const [budgetState, setBudgetState] = useState<TourismBudgetState>(() => {
    try {
      const stored = localStorage.getItem(LS_BUDGET_KEY);
      if (stored) {
        const parsed = { ...DEFAULT_BUDGET_STATE, ...JSON.parse(stored) };
        // migrate old values
        if (parsed.accommodation === "hotel") parsed.accommodation = "hotel3";
        if (parsed.accommodation === "resort") parsed.accommodation = "hotel5";
        if (parsed.accommodation === "rental") parsed.accommodation = "airbnb";
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_BUDGET_STATE;
  });

  const [travelDates, setTravelDates] = useState<TravelDates>(() => {
    try {
      const stored = localStorage.getItem(LS_DATES_KEY);
      if (stored) return { ...DEFAULT_TRAVEL_DATES, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return DEFAULT_TRAVEL_DATES;
  });

  useEffect(() => {
    localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_REGIONS_KEY,
        JSON.stringify([...selectedRegions]),
      );
    } catch {
      /* ignore */
    }
  }, [selectedRegions]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_TOGGLES_KEY, JSON.stringify(toggles));
    } catch {
      /* ignore */
    }
  }, [toggles]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(budgetState));
    } catch {
      /* ignore */
    }
  }, [budgetState]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_DATES_KEY, JSON.stringify(travelDates));
    } catch {
      /* ignore */
    }
  }, [travelDates]);

  const handleWeightChange = useCallback((key: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, Math.round(value))),
    }));
  }, []);

  const handleToggle = useCallback((key: "visaFreeOnly") => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleToggleTag = useCallback((tag: TourismTag) => {
    setToggles((prev) => {
      const tags = prev.requiredTags;
      const next = tags.includes(tag)
        ? tags.filter((t) => t !== tag)
        : [...tags, tag];
      return { ...prev, requiredTags: next };
    });
  }, []);

  const setBudgetField = useCallback(
    <K extends keyof TourismBudgetState>(
      key: K,
      value: TourismBudgetState[K],
    ) => {
      setBudgetState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setToggleField = useCallback(
    <K extends keyof TourismToggles>(key: K, value: TourismToggles[K]) => {
      setToggles((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setWeights(defaultTourismWeights());
    setSelectedRegions(new Set());
    setToggles(DEFAULT_TOGGLES);
    setBudgetState(DEFAULT_BUDGET_STATE);
    setTravelDates(DEFAULT_TRAVEL_DATES);
  }, []);

  const weightsAreDefault = useMemo(() => {
    const def = defaultTourismWeights();
    return (
      TOURISM_CATEGORY_KEYS.every((k) => weights[k] === def[k]) &&
      selectedRegions.size === 0 &&
      !toggles.visaFreeOnly &&
      toggles.requiredTags.length === 0 &&
      toggles.activityBlend === DEFAULT_TOGGLES.activityBlend &&
      budgetState.dailyBudget === DEFAULT_BUDGET_STATE.dailyBudget &&
      budgetState.accommodation === DEFAULT_BUDGET_STATE.accommodation &&
      budgetState.peopleCount === DEFAULT_BUDGET_STATE.peopleCount &&
      budgetState.budgetBlend === DEFAULT_BUDGET_STATE.budgetBlend &&
      travelDates.startDate === null &&
      travelDates.endDate === null
    );
  }, [weights, selectedRegions, toggles, budgetState, travelDates]);

  return {
    weights,
    handleWeightChange,
    handleReset,
    weightsAreDefault,
    selectedRegions,
    setSelectedRegions,
    toggles,
    handleToggle,
    handleToggleTag,
    setToggleField,
    budgetState,
    setBudgetField,
    travelDates,
    setTravelDates,
  };
}
