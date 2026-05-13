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

export interface BudgetPreferenceActions {
  setBudget: (budget: number) => void;
  setHousing: (housing: HousingPreference) => void;
  setPeopleCount: (peopleCount: number) => void;
  setBedrooms: (bedrooms: Bedrooms) => void;
  setQualityBlend: (qualityBlend: number) => void;
  handleCategoryWeight: (key: keyof BudgetCategoryWeights, value: number) => void;
  handleReset: () => void;
}

export type BudgetPreferenceStore = BudgetPreferencesState & BudgetPreferenceActions;
