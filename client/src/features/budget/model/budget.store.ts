import { createAppStore } from "../../../app/store/createStore";
import { readVersionedJson, writeVersionedJson } from "../../../shared/lib/storage";

const LS_BUDGET_KEY = "nomad-lens:budget";
const BUDGET_STORAGE_VERSION = 1;
const MIN_BUDGET = 300;
const MAX_BUDGET = 10000;
const MIN_PEOPLE_COUNT = 1;
const MAX_PEOPLE_COUNT = 20;
const MIN_QUALITY_BLEND = 0;
const MAX_QUALITY_BLEND = 100;

export type HousingPreference = "majorCity" | "smallerCity";
export type Bedrooms = 1 | 2 | 3;

export interface BudgetCategoryWeights {
  housing: number;
  groceries: number;
  dining: number;
  transport: number;
  utilities: number;
  coworking: number;
  healthInsurance: number;
}

export interface BudgetPreferencesState {
  budget: number;
  housing: HousingPreference;
  peopleCount: number;
  bedrooms: Bedrooms;
  qualityBlend: number;
  categoryWeights: BudgetCategoryWeights;
}

interface BudgetPreferenceActions {
  setBudget: (budget: number) => void;
  setHousing: (housing: HousingPreference) => void;
  setPeopleCount: (peopleCount: number) => void;
  setBedrooms: (bedrooms: Bedrooms) => void;
  setQualityBlend: (qualityBlend: number) => void;
  handleCategoryWeight: (key: keyof BudgetCategoryWeights, value: number) => void;
  handleReset: () => void;
}

export type BudgetPreferenceStore = BudgetPreferencesState & BudgetPreferenceActions;

const DEFAULT_BUDGET = 2000;
export const DEFAULT_QUALITY_BLEND = 30;
export const DEFAULT_HOUSING: HousingPreference = "majorCity";
export const DEFAULT_PEOPLE_COUNT = 1;
export const DEFAULT_BEDROOMS: Bedrooms = 1;

export const DEFAULT_CATEGORY_WEIGHTS: BudgetCategoryWeights = {
  housing: 100,
  groceries: 100,
  dining: 100,
  transport: 100,
  utilities: 100,
  coworking: 100,
  healthInsurance: 100,
};

export const CATEGORY_WEIGHT_KEYS = Object.keys(
  DEFAULT_CATEGORY_WEIGHTS,
) as (keyof BudgetCategoryWeights)[];

const BEDROOM_OPTIONS = new Set<Bedrooms>([1, 2, 3]);
const CATEGORY_WEIGHT_KEY_SET = new Set<keyof BudgetCategoryWeights>(CATEGORY_WEIGHT_KEYS);

export function createDefaultBudgetPreferences(): BudgetPreferencesState {
  return {
    budget: DEFAULT_BUDGET,
    housing: DEFAULT_HOUSING,
    peopleCount: DEFAULT_PEOPLE_COUNT,
    bedrooms: DEFAULT_BEDROOMS,
    qualityBlend: DEFAULT_QUALITY_BLEND,
    categoryWeights: { ...DEFAULT_CATEGORY_WEIGHTS },
  };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseClampedInteger(value: string | null, min: number, max: number): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return clampNumber(Math.round(parsed), min, max);
}

export function sanitizeBudgetCategoryWeights(
  weights?: Partial<BudgetCategoryWeights>,
): BudgetCategoryWeights {
  const next = { ...DEFAULT_CATEGORY_WEIGHTS };

  for (const key of CATEGORY_WEIGHT_KEYS) {
    const value = weights?.[key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    next[key] = clampNumber(Math.round(value), 0, 100);
  }

  return next;
}

export function sanitizeBudgetPreferences(value: unknown): BudgetPreferencesState {
  const fallback = createDefaultBudgetPreferences();
  if (typeof value !== "object" || value === null) return fallback;

  const parsed = value as Partial<BudgetPreferencesState>;
  return {
    budget:
      typeof parsed.budget === "number" && Number.isFinite(parsed.budget)
        ? clampNumber(Math.round(parsed.budget), MIN_BUDGET, MAX_BUDGET)
        : fallback.budget,
    housing: parsed.housing === "smallerCity" ? "smallerCity" : "majorCity",
    peopleCount:
      typeof parsed.peopleCount === "number" && Number.isFinite(parsed.peopleCount)
        ? clampNumber(Math.round(parsed.peopleCount), MIN_PEOPLE_COUNT, MAX_PEOPLE_COUNT)
        : fallback.peopleCount,
    bedrooms: BEDROOM_OPTIONS.has(parsed.bedrooms as Bedrooms)
      ? (parsed.bedrooms as Bedrooms)
      : fallback.bedrooms,
    qualityBlend:
      typeof parsed.qualityBlend === "number" && Number.isFinite(parsed.qualityBlend)
        ? clampNumber(Math.round(parsed.qualityBlend), MIN_QUALITY_BLEND, MAX_QUALITY_BLEND)
        : fallback.qualityBlend,
    categoryWeights: sanitizeBudgetCategoryWeights(parsed.categoryWeights),
  };
}

function hasBudgetQueryState(search: string): boolean {
  const params = new URLSearchParams(search);
  return ["budget", "housing", "bedrooms", "people", "quality", "cw"].some((key) =>
    params.has(key),
  );
}

function parseCategoryWeightsParam(value: string | null): Partial<BudgetCategoryWeights> {
  if (!value) return {};

  const weights: Partial<BudgetCategoryWeights> = {};

  for (const pair of value.split(",")) {
    const [rawKey, rawWeight] = pair.split(":");
    if (!rawKey || !rawWeight) continue;
    if (!CATEGORY_WEIGHT_KEY_SET.has(rawKey as keyof BudgetCategoryWeights)) continue;

    const parsedWeight = parseClampedInteger(rawWeight, 0, 100);
    if (parsedWeight === null) continue;
    weights[rawKey as keyof BudgetCategoryWeights] = parsedWeight;
  }

  return weights;
}

export function buildBudgetPreferencesFromSearch(search: string): BudgetPreferencesState {
  const params = new URLSearchParams(search);
  const next = createDefaultBudgetPreferences();

  const budget = parseClampedInteger(params.get("budget"), MIN_BUDGET, MAX_BUDGET);
  if (budget !== null) next.budget = budget;

  const housing = params.get("housing");
  if (housing === "majorCity" || housing === "smallerCity") {
    next.housing = housing;
  }

  const bedrooms = parseClampedInteger(params.get("bedrooms"), 1, 3);
  if (BEDROOM_OPTIONS.has(bedrooms as Bedrooms)) {
    next.bedrooms = bedrooms as Bedrooms;
  }

  const people = parseClampedInteger(params.get("people"), MIN_PEOPLE_COUNT, MAX_PEOPLE_COUNT);
  if (people !== null) next.peopleCount = people;

  const quality = parseClampedInteger(params.get("quality"), MIN_QUALITY_BLEND, MAX_QUALITY_BLEND);
  if (quality !== null) next.qualityBlend = quality;

  next.categoryWeights = sanitizeBudgetCategoryWeights(parseCategoryWeightsParam(params.get("cw")));

  return next;
}

export function isDefaultBudgetPreferences(state: BudgetPreferencesState): boolean {
  return (
    state.budget === DEFAULT_BUDGET &&
    state.housing === DEFAULT_HOUSING &&
    state.peopleCount === DEFAULT_PEOPLE_COUNT &&
    state.bedrooms === DEFAULT_BEDROOMS &&
    state.qualityBlend === DEFAULT_QUALITY_BLEND &&
    CATEGORY_WEIGHT_KEYS.every(
      (key) => state.categoryWeights[key] === DEFAULT_CATEGORY_WEIGHTS[key],
    )
  );
}

function getInitialBudgetPreferences(): BudgetPreferencesState {
  if (typeof window !== "undefined" && hasBudgetQueryState(window.location.search)) {
    return buildBudgetPreferencesFromSearch(window.location.search);
  }

  return readVersionedJson({
    key: LS_BUDGET_KEY,
    version: BUDGET_STORAGE_VERSION,
    fallback: createDefaultBudgetPreferences,
    sanitize: sanitizeBudgetPreferences,
    migrate: (value) => sanitizeBudgetPreferences(value),
  });
}

function persistBudgetPreferences(state: BudgetPreferencesState) {
  writeVersionedJson(LS_BUDGET_KEY, BUDGET_STORAGE_VERSION, state);
}

function commitBudgetPreferences(
  set: (partial: Partial<BudgetPreferenceStore>) => void,
  partial: Partial<BudgetPreferencesState>,
  current: BudgetPreferencesState,
) {
  const next = { ...current, ...partial };
  persistBudgetPreferences(next);
  set(partial);
}

export const useBudgetPreferenceStore = createAppStore<BudgetPreferenceStore>((set, get) => ({
  ...getInitialBudgetPreferences(),
  setBudget: (budget) =>
    commitBudgetPreferences(
      set,
      { budget: clampNumber(Math.round(budget), MIN_BUDGET, MAX_BUDGET) },
      get(),
    ),
  setHousing: (housing) => commitBudgetPreferences(set, { housing }, get()),
  setPeopleCount: (peopleCount) =>
    commitBudgetPreferences(
      set,
      {
        peopleCount: clampNumber(Math.round(peopleCount), MIN_PEOPLE_COUNT, MAX_PEOPLE_COUNT),
      },
      get(),
    ),
  setBedrooms: (bedrooms) => commitBudgetPreferences(set, { bedrooms }, get()),
  setQualityBlend: (qualityBlend) =>
    commitBudgetPreferences(
      set,
      {
        qualityBlend: clampNumber(Math.round(qualityBlend), MIN_QUALITY_BLEND, MAX_QUALITY_BLEND),
      },
      get(),
    ),
  handleCategoryWeight: (key, value) => {
    const categoryWeights = {
      ...get().categoryWeights,
      [key]: clampNumber(Math.round(value), 0, 100),
    };
    commitBudgetPreferences(set, { categoryWeights }, get());
  },
  handleReset: () => {
    const next = createDefaultBudgetPreferences();
    persistBudgetPreferences(next);
    set(next);
  },
}));
