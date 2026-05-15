import type {
  Bedrooms,
  BudgetCategoryWeights,
  HousingPreference,
} from "../models/budget-preferences.models";

export const LS_BUDGET_KEY = "nomad-lens:budget";
export const BUDGET_STORAGE_VERSION = 1;

export const MIN_BUDGET = 300;
export const MAX_BUDGET = 10_000;
export const MIN_PEOPLE_COUNT = 1;
export const MAX_PEOPLE_COUNT = 20;
export const MIN_QUALITY_BLEND = 0;
export const MAX_QUALITY_BLEND = 100;

export const DEFAULT_BUDGET = 2000;
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

export const CATEGORY_WEIGHT_KEYS = Object.keys(DEFAULT_CATEGORY_WEIGHTS) as Array<
  keyof BudgetCategoryWeights
>;

export const BUDGET_BEDROOM_OPTIONS = [1, 2, 3] as const satisfies readonly Bedrooms[];
export const BUDGET_HOUSING_OPTIONS = [
  "majorCity",
  "smallerCity",
] as const satisfies readonly HousingPreference[];

export const BEDROOM_OPTIONS = new Set<Bedrooms>(BUDGET_BEDROOM_OPTIONS);
export const CATEGORY_WEIGHT_KEY_SET = new Set<keyof BudgetCategoryWeights>(CATEGORY_WEIGHT_KEYS);
