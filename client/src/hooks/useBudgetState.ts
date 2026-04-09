import { useCallback, useEffect, useMemo, useState } from "react";

const LS_BUDGET_KEY = "nomad-lens:budget";
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

const CATEGORY_WEIGHT_KEYS = Object.keys(
  DEFAULT_CATEGORY_WEIGHTS,
) as (keyof BudgetCategoryWeights)[];

function createDefaultState(): StoredState {
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

function parseClampedInteger(
  value: string | null,
  min: number,
  max: number,
): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return clampNumber(Math.round(parsed), min, max);
}

function sanitizeCategoryWeights(
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

function loadStoredState(): StoredState {
  const fallback = createDefaultState();
  try {
    const raw = localStorage.getItem(LS_BUDGET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      return {
        budget:
          typeof parsed.budget === "number" && Number.isFinite(parsed.budget)
            ? clampNumber(Math.round(parsed.budget), MIN_BUDGET, MAX_BUDGET)
            : fallback.budget,
        housing: parsed.housing === "smallerCity" ? "smallerCity" : "majorCity",
        peopleCount:
          typeof parsed.peopleCount === "number" &&
          Number.isFinite(parsed.peopleCount)
            ? clampNumber(
                Math.round(parsed.peopleCount),
                MIN_PEOPLE_COUNT,
                MAX_PEOPLE_COUNT,
              )
            : fallback.peopleCount,
        bedrooms: ([1, 2, 3] as const).includes(parsed.bedrooms as Bedrooms)
          ? (parsed.bedrooms as Bedrooms)
          : fallback.bedrooms,
        qualityBlend:
          typeof parsed.qualityBlend === "number" &&
          Number.isFinite(parsed.qualityBlend)
            ? clampNumber(
                Math.round(parsed.qualityBlend),
                MIN_QUALITY_BLEND,
                MAX_QUALITY_BLEND,
              )
            : fallback.qualityBlend,
        categoryWeights: sanitizeCategoryWeights(parsed.categoryWeights),
      };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return fallback;
}

function hasBudgetQueryState(search: string): boolean {
  const params = new URLSearchParams(search);
  return ["budget", "housing", "bedrooms", "people", "quality", "cw"].some(
    (key) => params.has(key),
  );
}

function parseCategoryWeightsParam(
  value: string | null,
): Partial<BudgetCategoryWeights> {
  if (!value) return {};

  const weights: Partial<BudgetCategoryWeights> = {};

  for (const pair of value.split(",")) {
    const [rawKey, rawWeight] = pair.split(":");
    if (!rawKey || !rawWeight) continue;
    if (!CATEGORY_WEIGHT_KEYS.includes(rawKey as keyof BudgetCategoryWeights)) {
      continue;
    }
    const parsedWeight = parseClampedInteger(rawWeight, 0, 100);
    if (parsedWeight === null) continue;
    weights[rawKey as keyof BudgetCategoryWeights] = parsedWeight;
  }

  return weights;
}

function buildStateFromSearch(search: string): StoredState {
  const params = new URLSearchParams(search);
  const next = createDefaultState();

  const budget = parseClampedInteger(
    params.get("budget"),
    MIN_BUDGET,
    MAX_BUDGET,
  );
  if (budget !== null) next.budget = budget;

  const housing = params.get("housing");
  if (housing === "majorCity" || housing === "smallerCity") {
    next.housing = housing;
  }

  const bedrooms = parseClampedInteger(params.get("bedrooms"), 1, 3);
  if (bedrooms === 1 || bedrooms === 2 || bedrooms === 3) {
    next.bedrooms = bedrooms;
  }

  const people = parseClampedInteger(
    params.get("people"),
    MIN_PEOPLE_COUNT,
    MAX_PEOPLE_COUNT,
  );
  if (people !== null) next.peopleCount = people;

  const quality = parseClampedInteger(
    params.get("quality"),
    MIN_QUALITY_BLEND,
    MAX_QUALITY_BLEND,
  );
  if (quality !== null) next.qualityBlend = quality;

  next.categoryWeights = sanitizeCategoryWeights(
    parseCategoryWeightsParam(params.get("cw")),
  );

  return next;
}

export function useBudgetState() {
  const [initialState] = useState<StoredState>(() =>
    hasBudgetQueryState(window.location.search)
      ? buildStateFromSearch(window.location.search)
      : loadStoredState(),
  );

  const [budget, setBudget] = useState(initialState.budget);
  const [housing, setHousing] = useState<HousingPreference>(
    initialState.housing,
  );
  const [peopleCount, setPeopleCount] = useState(initialState.peopleCount);
  const [bedrooms, setBedrooms] = useState<Bedrooms>(initialState.bedrooms);
  const [qualityBlend, setQualityBlend] = useState(initialState.qualityBlend);
  const [categoryWeights, setCategoryWeights] = useState<BudgetCategoryWeights>(
    initialState.categoryWeights,
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
