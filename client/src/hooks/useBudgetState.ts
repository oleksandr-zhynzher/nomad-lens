import { useCallback, useEffect, useMemo, useState } from "react";

const LS_BUDGET_KEY = "nomad-lens:budget";

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

const DEFAULT_BUDGET = 2000;
const DEFAULT_QUALITY_BLEND = 30;
const DEFAULT_HOUSING: HousingPreference = "majorCity";
const DEFAULT_PEOPLE_COUNT = 1;
const DEFAULT_BEDROOMS: Bedrooms = 1;

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
  peopleCount: number;
  bedrooms: Bedrooms;
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
        housing: parsed.housing === "smallerCity" ? "smallerCity" : "majorCity",
        peopleCount:
          typeof parsed.peopleCount === "number" && parsed.peopleCount >= 1
            ? Math.round(parsed.peopleCount)
            : DEFAULT_PEOPLE_COUNT,
        bedrooms: ([1, 2, 3] as const).includes(parsed.bedrooms as Bedrooms)
          ? (parsed.bedrooms as Bedrooms)
          : DEFAULT_BEDROOMS,
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
    peopleCount: DEFAULT_PEOPLE_COUNT,
    bedrooms: DEFAULT_BEDROOMS,
    qualityBlend: DEFAULT_QUALITY_BLEND,
    categoryWeights: DEFAULT_CATEGORY_WEIGHTS,
  };
}

export function useBudgetState() {
  const [budget, setBudget] = useState(() => loadState().budget);
  const [housing, setHousing] = useState<HousingPreference>(
    () => loadState().housing,
  );
  const [peopleCount, setPeopleCount] = useState(() => loadState().peopleCount);
  const [bedrooms, setBedrooms] = useState<Bedrooms>(
    () => loadState().bedrooms,
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
        JSON.stringify({
          budget,
          housing,
          peopleCount,
          bedrooms,
          qualityBlend,
          categoryWeights,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [budget, housing, peopleCount, bedrooms, qualityBlend, categoryWeights]);

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
    setPeopleCount(DEFAULT_PEOPLE_COUNT);
    setBedrooms(DEFAULT_BEDROOMS);
    setQualityBlend(DEFAULT_QUALITY_BLEND);
    setCategoryWeights(DEFAULT_CATEGORY_WEIGHTS);
  }, []);

  const isDefault = useMemo(() => {
    const catKeys = Object.keys(
      DEFAULT_CATEGORY_WEIGHTS,
    ) as (keyof BudgetCategoryWeights)[];
    return (
      budget === DEFAULT_BUDGET &&
      housing === DEFAULT_HOUSING &&
      peopleCount === DEFAULT_PEOPLE_COUNT &&
      bedrooms === DEFAULT_BEDROOMS &&
      qualityBlend === DEFAULT_QUALITY_BLEND &&
      catKeys.every((k) => categoryWeights[k] === DEFAULT_CATEGORY_WEIGHTS[k])
    );
  }, [budget, housing, peopleCount, bedrooms, qualityBlend, categoryWeights]);

  const handleShare = useCallback(() => {
    const params = new URLSearchParams();
    params.set("budget", String(budget));
    if (housing !== DEFAULT_HOUSING) params.set("housing", housing);
    if (bedrooms !== DEFAULT_BEDROOMS) params.set("bedrooms", String(bedrooms));
    if (peopleCount !== DEFAULT_PEOPLE_COUNT)
      params.set("people", String(peopleCount));
    if (qualityBlend !== DEFAULT_QUALITY_BLEND)
      params.set("quality", String(qualityBlend));
    const catKeys = Object.keys(
      DEFAULT_CATEGORY_WEIGHTS,
    ) as (keyof BudgetCategoryWeights)[];
    const nonDefault = catKeys.filter(
      (k) => categoryWeights[k] !== DEFAULT_CATEGORY_WEIGHTS[k],
    );
    if (nonDefault.length > 0) {
      params.set(
        "cw",
        nonDefault.map((k) => `${k}:${categoryWeights[k]}`).join(","),
      );
    }
    const url =
      window.location.origin +
      window.location.pathname +
      "?" +
      params.toString();
    navigator.clipboard.writeText(url).catch(() => {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
  }, [budget, housing, bedrooms, peopleCount, qualityBlend, categoryWeights]);

  return {
    budget,
    setBudget,
    housing,
    setHousing,
    peopleCount,
    setPeopleCount,
    bedrooms,
    setBedrooms,
    qualityBlend,
    setQualityBlend,
    categoryWeights,
    handleCategoryWeight,
    handleReset,
    isDefault,
    handleShare,
  };
}
