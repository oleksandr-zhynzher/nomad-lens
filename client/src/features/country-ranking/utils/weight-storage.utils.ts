import {
  defaultClimatePreferences,
  defaultIndependentWeights,
  defaultWeights,
} from "./scoring.utils";
import type { ClimatePreferences, WeightMap, WeightMode } from "@core/models";
import { CATEGORY_KEYS, VISIBLE_CATEGORY_KEYS } from "@core/models";

export const LS_WEIGHTS_KEY = "nomad-lens:weights";
export const LS_WEIGHT_MODE_KEY = "nomad-lens:weight-mode";
export const LS_FILTERS_KEY = "nomad-lens:filters";

export const WEIGHT_SHARE_KEYS = [
  "nomadVisa",
  "schengen",
  "minDays",
  "regions",
  "climateSeason",
  "climateMin",
  "climateMax",
  "weightMode",
  ...CATEGORY_KEYS,
];

export interface LoadedFilters {
  nomadVisaOnly: boolean;
  schengenOnly: boolean;
  minTouristDays: number | null;
  selectedRegions: Set<string>;
  climatePrefs: ClimatePreferences;
}

function normalizeBalancedWeights(base: WeightMap): WeightMap {
  const visibleSum = VISIBLE_CATEGORY_KEYS.reduce((s, k) => s + base[k], 0);
  if (visibleSum === 0 || visibleSum === 100) return base;
  const scale = 100 / visibleSum;
  const exactShares = VISIBLE_CATEGORY_KEYS.map((k) => base[k] * scale);
  const floors = exactShares.map((s) => Math.floor(s));
  const floorSum = floors.reduce((a, b) => a + b, 0);
  let leftover = 100 - floorSum;
  const remainders = exactShares.map((s, i) => ({ i, r: s - floors[i] }));
  remainders.sort((a, b) => b.r - a.r);
  for (const { i } of remainders) {
    if (leftover > 0) {
      floors[i]++;
      leftover--;
    }
  }
  for (const [i, k] of VISIBLE_CATEGORY_KEYS.entries()) {
    base[k] = floors[i] ?? 0;
  }
  return base;
}

export function weightsFromSearch(search: string): WeightMap {
  const params = new URLSearchParams(search);
  const mode = params.get("weightMode") === "balanced" ? "balanced" : "independent";
  const base = mode === "independent" ? defaultIndependentWeights() : defaultWeights();
  let hasParams = false;
  for (const key of CATEGORY_KEYS) {
    const v = params.get(key);
    if (v !== null) {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        base[key] = Math.max(0, Math.min(100, n));
        hasParams = true;
      }
    }
  }
  if (!hasParams) return base;
  return mode === "balanced" ? normalizeBalancedWeights(base) : base;
}

export function weightsToSearch(weights: WeightMap): string {
  const params = new URLSearchParams();
  for (const key of CATEGORY_KEYS) {
    params.set(key, String(weights[key]));
  }
  return params.toString();
}

export function filtersToStorable(f: LoadedFilters) {
  return {
    nomadVisa: f.nomadVisaOnly,
    schengen: f.schengenOnly,
    minDays: f.minTouristDays,
    regions: [...f.selectedRegions],
    climateSeason: f.climatePrefs.seasonType,
    climateMin: f.climatePrefs.minTemp,
    climateMax: f.climatePrefs.maxTemp,
  };
}

/**
 * Read and consume weight/filter share params from the URL once.
 * Non-weight params (c, m, view, etc.) are preserved in the URL.
 * Returns null if no weight share params were found.
 */
export function consumeSharedParams(): URLSearchParams | null {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const hasShared =
    CATEGORY_KEYS.some((k) => urlParams.has(k)) ||
    [
      "nomadVisa",
      "schengen",
      "minDays",
      "regions",
      "climateSeason",
      "climateMin",
      "climateMax",
      "weightMode",
    ].some((k) => urlParams.has(k));
  if (!hasShared) return null;

  // Strip only weight/filter params, preserve others (c, m, etc.)
  const cleaned = new URLSearchParams(globalThis.location.search);
  for (const k of [
    ...CATEGORY_KEYS,
    "nomadVisa",
    "schengen",
    "minDays",
    "regions",
    "climateSeason",
    "climateMin",
    "climateMax",
    "weightMode",
  ]) {
    cleaned.delete(k);
  }
  const newSearch = cleaned.toString();
  globalThis.history.replaceState(
    null,
    "",
    globalThis.location.pathname + (newSearch !== "" ? `?${newSearch}` : ""),
  );
  return urlParams;
}

// Module-level: consumed once on first import, shared across all pages.
// Guard for non-browser environments (tests / SSR).
const _sharedParams = "localStorage" in globalThis ? consumeSharedParams() : null;

export function loadWeightModeFromStorage(): WeightMode {
  if (_sharedParams?.get("weightMode") === "balanced") {
    try {
      localStorage.setItem(LS_WEIGHT_MODE_KEY, "balanced");
    } catch {
      /* ignore */
    }
    return "balanced";
  }
  if (_sharedParams?.get("weightMode") === "independent") {
    try {
      localStorage.setItem(LS_WEIGHT_MODE_KEY, "independent");
    } catch {
      /* ignore */
    }
    return "independent";
  }
  try {
    const raw = localStorage.getItem(LS_WEIGHT_MODE_KEY);
    if (raw === "balanced" || raw === "independent") return raw;
  } catch {
    /* ignore */
  }
  return "independent";
}

export function loadWeightsFromStorage(): WeightMap {
  if (_sharedParams && CATEGORY_KEYS.some((k) => _sharedParams.has(k))) {
    const imported = weightsFromSearch(_sharedParams.toString());
    try {
      localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(imported));
    } catch {
      /* ignore */
    }
    return imported;
  }
  try {
    const raw = localStorage.getItem(LS_WEIGHTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const mode = loadWeightModeFromStorage();
      const base = mode === "independent" ? defaultIndependentWeights() : defaultWeights();
      for (const key of CATEGORY_KEYS) {
        const v = parsed[key];
        if (typeof v === "number" && !Number.isNaN(v)) {
          base[key] = Math.max(0, Math.min(100, Math.round(v)));
        }
      }
      return base;
    }
  } catch {
    /* ignore */
  }
  const mode = loadWeightModeFromStorage();
  return mode === "independent" ? defaultIndependentWeights() : defaultWeights();
}

function climatePrefsFromSharedParams(
  p: URLSearchParams,
  def: ClimatePreferences,
): ClimatePreferences {
  return {
    seasonType: (p.get("climateSeason") ?? def.seasonType) as ClimatePreferences["seasonType"],
    minTemp:
      p.has("climateMin") && !Number.isNaN(Number(p.get("climateMin")))
        ? Number(p.get("climateMin"))
        : def.minTemp,
    maxTemp:
      p.has("climateMax") && !Number.isNaN(Number(p.get("climateMax")))
        ? Number(p.get("climateMax"))
        : def.maxTemp,
  };
}

function filtersFromSharedParams(p: URLSearchParams, def: ClimatePreferences): LoadedFilters {
  const minDaysStr = p.get("minDays");
  const regionsStr = p.get("regions");
  return {
    nomadVisaOnly: p.get("nomadVisa") === "1",
    schengenOnly: p.get("schengen") === "1",
    minTouristDays:
      minDaysStr !== null && !Number.isNaN(Number(minDaysStr)) ? Number(minDaysStr) : null,
    selectedRegions:
      regionsStr !== null
        ? new Set(regionsStr.split(",").filter((s): s is string => s !== ""))
        : new Set<string>(),
    climatePrefs: climatePrefsFromSharedParams(p, def),
  };
}

function filtersFromParsed(p: Record<string, unknown>, def: ClimatePreferences): LoadedFilters {
  return {
    nomadVisaOnly: p.nomadVisa === true,
    schengenOnly: p.schengen === true,
    minTouristDays: typeof p.minDays === "number" ? p.minDays : null,
    selectedRegions: Array.isArray(p.regions)
      ? new Set(p.regions.filter((r): r is string => typeof r === "string"))
      : new Set<string>(),
    climatePrefs: {
      seasonType:
        typeof p.climateSeason === "string"
          ? (p.climateSeason as ClimatePreferences["seasonType"])
          : def.seasonType,
      minTemp: typeof p.climateMin === "number" ? p.climateMin : def.minTemp,
      maxTemp: typeof p.climateMax === "number" ? p.climateMax : def.maxTemp,
    },
  };
}

export function loadFiltersFromStorage(): LoadedFilters {
  const def = defaultClimatePreferences();
  if (_sharedParams !== null) {
    const loaded = filtersFromSharedParams(_sharedParams, def);
    try {
      localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filtersToStorable(loaded)));
    } catch {
      /* ignore */
    }
    return loaded;
  }
  try {
    const raw = localStorage.getItem(LS_FILTERS_KEY);
    if (raw !== null) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      return filtersFromParsed(p, def);
    }
  } catch {
    /* ignore */
  }
  return {
    nomadVisaOnly: false,
    schengenOnly: false,
    minTouristDays: null,
    selectedRegions: new Set<string>(),
    climatePrefs: def,
  };
}
