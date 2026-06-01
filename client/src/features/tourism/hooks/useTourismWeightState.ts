import { TOURISM_CATEGORY_KEYS } from "@core/models";
import { readVersionedJson, writeVersionedJson } from "@core/utils";
import type { TourismWeightMap } from "@features/tourism/utils";
import { defaultTourismWeights } from "@features/tourism/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

const LS_WEIGHTS_KEY = "tourism-weights";
const LS_REGIONS_KEY = "tourism-regions";
const LS_TOGGLES_KEY = "tourism-toggles";
const LS_BUDGET_KEY = "tourism-budget";
const LS_DATES_KEY = "tourism-dates";
const TOURISM_STORAGE_VERSION = 1;

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

const ACCOMMODATION_TYPES = new Set<AccommodationType>([
  "hotel5",
  "hotel4",
  "hotel3",
  "hotel2",
  "hotel1",
  "hostel",
  "airbnb",
]);
const DINING_PREFERENCES = new Set<DiningPreference>(["market", "casual", "restaurants"]);
const STORAGE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function clampPercent(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : fallback;
}

function sanitizeTourismWeights(value: unknown): TourismWeightMap {
  const next = defaultTourismWeights();
  if (typeof value !== "object" || value === null || Array.isArray(value)) return next;

  for (const key of TOURISM_CATEGORY_KEYS) {
    next[key] = clampPercent((value as Record<string, unknown>)[key], next[key] ?? 50);
  }

  return next;
}

function sanitizeRegions(value: unknown): Set<string> {
  return Array.isArray(value)
    ? new Set(value.filter((region): region is string => typeof region === "string"))
    : new Set<string>();
}

function sanitizeToggles(value: unknown): TourismToggles {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return DEFAULT_TOGGLES;
  const record = value as Record<string, unknown>;
  const requiredTags = Array.isArray(record["requiredTags"])
    ? record["requiredTags"].filter((tag): tag is TourismTag =>
        ALL_TOURISM_TAGS.includes(tag as TourismTag),
      )
    : DEFAULT_TOGGLES.requiredTags;

  return {
    visaFreeOnly:
      typeof record["visaFreeOnly"] === "boolean"
        ? record["visaFreeOnly"]
        : DEFAULT_TOGGLES.visaFreeOnly,
    requiredTags,
    activityBlend: clampPercent(record["activityBlend"], DEFAULT_TOGGLES.activityBlend),
  };
}

function sanitizeBudgetState(value: unknown): TourismBudgetState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return DEFAULT_BUDGET_STATE;
  }
  const record = value as Record<string, unknown>;
  let accommodation = record["accommodation"];
  if (accommodation === "hotel") accommodation = "hotel3";
  if (accommodation === "resort") accommodation = "hotel5";
  if (accommodation === "rental") accommodation = "airbnb";

  return {
    dailyBudget:
      typeof record["dailyBudget"] === "number" && Number.isFinite(record["dailyBudget"])
        ? Math.max(1, Math.round(record["dailyBudget"]))
        : DEFAULT_BUDGET_STATE.dailyBudget,
    accommodation:
      typeof accommodation === "string" &&
      ACCOMMODATION_TYPES.has(accommodation as AccommodationType)
        ? (accommodation as AccommodationType)
        : DEFAULT_BUDGET_STATE.accommodation,
    dining:
      typeof record["dining"] === "string" &&
      DINING_PREFERENCES.has(record["dining"] as DiningPreference)
        ? (record["dining"] as DiningPreference)
        : DEFAULT_BUDGET_STATE.dining,
    peopleCount:
      typeof record["peopleCount"] === "number" && Number.isFinite(record["peopleCount"])
        ? Math.max(1, Math.min(12, Math.round(record["peopleCount"])))
        : DEFAULT_BUDGET_STATE.peopleCount,
    budgetBlend: clampPercent(record["budgetBlend"], DEFAULT_BUDGET_STATE.budgetBlend),
    budgetEnabled:
      typeof record["budgetEnabled"] === "boolean"
        ? record["budgetEnabled"]
        : DEFAULT_BUDGET_STATE.budgetEnabled,
  };
}

function sanitizeTravelDates(value: unknown): TravelDates {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return DEFAULT_TRAVEL_DATES;
  }
  const record = value as Record<string, unknown>;
  const startDate =
    typeof record["startDate"] === "string" && STORAGE_DATE_PATTERN.test(record["startDate"])
      ? record["startDate"]
      : null;
  const endDate =
    typeof record["endDate"] === "string" && STORAGE_DATE_PATTERN.test(record["endDate"])
      ? record["endDate"]
      : null;

  return { startDate, endDate };
}

export function useTourismWeightState() {
  const [weights, setWeights] = useState<TourismWeightMap>(() =>
    readVersionedJson({
      key: LS_WEIGHTS_KEY,
      version: TOURISM_STORAGE_VERSION,
      fallback: defaultTourismWeights,
      sanitize: sanitizeTourismWeights,
      migrate: sanitizeTourismWeights,
    }),
  );

  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(() =>
    readVersionedJson({
      key: LS_REGIONS_KEY,
      version: TOURISM_STORAGE_VERSION,
      fallback: () => new Set<string>(),
      sanitize: sanitizeRegions,
      migrate: sanitizeRegions,
    }),
  );

  const [toggles, setToggles] = useState<TourismToggles>(() =>
    readVersionedJson({
      key: LS_TOGGLES_KEY,
      version: TOURISM_STORAGE_VERSION,
      fallback: () => DEFAULT_TOGGLES,
      sanitize: sanitizeToggles,
      migrate: sanitizeToggles,
    }),
  );

  const [budgetState, setBudgetState] = useState<TourismBudgetState>(() =>
    readVersionedJson({
      key: LS_BUDGET_KEY,
      version: TOURISM_STORAGE_VERSION,
      fallback: () => DEFAULT_BUDGET_STATE,
      sanitize: sanitizeBudgetState,
      migrate: sanitizeBudgetState,
    }),
  );

  const [travelDates, setTravelDates] = useState<TravelDates>(() =>
    readVersionedJson({
      key: LS_DATES_KEY,
      version: TOURISM_STORAGE_VERSION,
      fallback: () => DEFAULT_TRAVEL_DATES,
      sanitize: sanitizeTravelDates,
      migrate: sanitizeTravelDates,
    }),
  );

  useEffect(() => {
    writeVersionedJson(LS_WEIGHTS_KEY, TOURISM_STORAGE_VERSION, weights);
  }, [weights]);

  useEffect(() => {
    writeVersionedJson(LS_REGIONS_KEY, TOURISM_STORAGE_VERSION, [...selectedRegions]);
  }, [selectedRegions]);

  useEffect(() => {
    writeVersionedJson(LS_TOGGLES_KEY, TOURISM_STORAGE_VERSION, toggles);
  }, [toggles]);

  useEffect(() => {
    writeVersionedJson(LS_BUDGET_KEY, TOURISM_STORAGE_VERSION, budgetState);
  }, [budgetState]);

  useEffect(() => {
    writeVersionedJson(LS_DATES_KEY, TOURISM_STORAGE_VERSION, travelDates);
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
      const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
      return { ...prev, requiredTags: next };
    });
  }, []);

  const setBudgetField = useCallback(
    <K extends keyof TourismBudgetState>(key: K, value: TourismBudgetState[K]) => {
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
