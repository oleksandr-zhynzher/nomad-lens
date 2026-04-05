import { useCallback, useEffect, useState } from "react";

const LS_BUDGET_KEY = "nomad-lens:budget";

export type HousingPreference = "center" | "outside";

export interface BudgetCategoryWeights {
  housing: number;
  groceries: number;
  dining: number;
  transport: number;
  utilities: number;
  coworking: number;
  healthInsurance: number;
}

const DEFAULT_BUDGET = 2000;
const DEFAULT_QUALITY_BLEND = 30;
const DEFAULT_HOUSING: HousingPreference = "center";

const DEFAULT_CATEGORY_WEIGHTS: BudgetCategoryWeights = {
  housing: 100,
  groceries: 100,
  dining: 100,
  transport: 100,
  utilities: 100,
  coworking: 100,
  healthInsurance: 100,
};

interface StoredState {
  budget: number;
  housing: HousingPreference;
  qualityBlend: number;
  categoryWeights: BudgetCategoryWeights;
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(LS_BUDGET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      return {
        budget:
          typeof parsed.budget === "number" ? parsed.budget : DEFAULT_BUDGET,
        housing: parsed.housing === "outside" ? "outside" : "center",
        qualityBlend:
          typeof parsed.qualityBlend === "number"
            ? parsed.qualityBlend
            : DEFAULT_QUALITY_BLEND,
        categoryWeights: {
          ...DEFAULT_CATEGORY_WEIGHTS,
          ...parsed.categoryWeights,
        },
      };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return {
    budget: DEFAULT_BUDGET,
    housing: DEFAULT_HOUSING,
    qualityBlend: DEFAULT_QUALITY_BLEND,
    categoryWeights: DEFAULT_CATEGORY_WEIGHTS,
  };
}

export function useBudgetState() {
  const [budget, setBudget] = useState(() => loadState().budget);
  const [housing, setHousing] = useState<HousingPreference>(
    () => loadState().housing,
  );
  const [qualityBlend, setQualityBlend] = useState(
    () => loadState().qualityBlend,
  );
  const [categoryWeights, setCategoryWeights] = useState<BudgetCategoryWeights>(
    () => loadState().categoryWeights,
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_BUDGET_KEY,
        JSON.stringify({ budget, housing, qualityBlend, categoryWeights }),
      );
    } catch {
      /* ignore */
    }
  }, [budget, housing, qualityBlend, categoryWeights]);

  const handleCategoryWeight = useCallback(
    (key: keyof BudgetCategoryWeights, value: number) => {
      setCategoryWeights((prev) => ({
        ...prev,
        [key]: Math.max(0, Math.min(100, Math.round(value))),
      }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setBudget(DEFAULT_BUDGET);
    setHousing(DEFAULT_HOUSING);
    setQualityBlend(DEFAULT_QUALITY_BLEND);
    setCategoryWeights(DEFAULT_CATEGORY_WEIGHTS);
  }, []);

  return {
    budget,
    setBudget,
    housing,
    setHousing,
    qualityBlend,
    setQualityBlend,
    categoryWeights,
    handleCategoryWeight,
    handleReset,
  };
}
