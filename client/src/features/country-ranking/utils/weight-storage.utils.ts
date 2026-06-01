import type { ClimatePreferences, WeightMap, WeightMode } from "@core/models";
import { CATEGORY_KEYS, VISIBLE_CATEGORY_KEYS } from "@core/models";
import { readVersionedJson, writeVersionedJson } from "@core/utils";

import {
  defaultClimatePreferences,
  defaultIndependentWeights,
  defaultWeights,
} from "./scoring.utils";

export const LS_WEIGHTS_KEY = "nomad-lens:weights";
export const LS_WEIGHT_MODE_KEY = "nomad-lens:weight-mode";
export const LS_FILTERS_KEY = "nomad-lens:filters";
const WEIGHT_STORAGE_VERSION = 1;
const WEIGHT_MODE_STORAGE_VERSION = 1;
const FILTER_STORAGE_VERSION = 1;

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
  const remainders = exactShares.map((s, i) => {
    const floorVal = floors[i];
    if (floorVal === undefined) throw new Error("Floor value missing");
    return { i, r: s - floorVal };
  });
  remainders.sort((a, b) => b.r - a.r);
  for (const { i } of remainders) {
    if (leftover > 0) {
      const currentFloor = floors[i];
      if (currentFloor !== undefined) {
        floors[i] = currentFloor + 1;
      }
      leftover--;
    }
  }
  for (const [i, k] of VISIBLE_CATEGORY_KEYS.entries()) {
    const floorVal = floors[i];
    if (floorVal !== undefined) {
      base[k] = floorVal;
    }
  }
  return base;
}

function weightsFromSearch(search: string): WeightMap {
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

function clampWeight(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sanitizeWeightMode(value: unknown): WeightMode {
  return value === "balanced" || value === "independent" ? value : "independent";
}

function sanitizeWeights(value: unknown, mode: WeightMode): WeightMap {
  const base = mode === "independent" ? defaultIndependentWeights() : defaultWeights();
  if (typeof value !== "object" || value === null || Array.isArray(value)) return base;

  for (const key of CATEGORY_KEYS) {
    const raw = (value as Record<string, unknown>)[key];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      base[key] = clampWeight(raw);
    }
  }

  return mode === "balanced" ? normalizeBalancedWeights(base) : base;
}

/**
 * Read weight/filter params from the URL once.
 * Returns null if no weight share params were found.
 */
function readSharedParams(): URLSearchParams | null {
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

  return urlParams;
}

export function loadWeightModeFromStorage(): WeightMode {
  const sharedParams = readSharedParams();
  const sharedMode = sharedParams?.get("weightMode");
  if (sharedMode === "balanced" || sharedMode === "independent") {
    writeVersionedJson(LS_WEIGHT_MODE_KEY, WEIGHT_MODE_STORAGE_VERSION, sharedMode);
    return sharedMode;
  }

  return readVersionedJson({
    key: LS_WEIGHT_MODE_KEY,
    version: WEIGHT_MODE_STORAGE_VERSION,
    fallback: () => "independent",
    sanitize: sanitizeWeightMode,
    migrate: sanitizeWeightMode,
  });
}

export function loadWeightsFromStorage(): WeightMap {
  const sharedParams = readSharedParams();
  if (sharedParams && CATEGORY_KEYS.some((k) => sharedParams.has(k))) {
    const imported = weightsFromSearch(sharedParams.toString());
    writeVersionedJson(LS_WEIGHTS_KEY, WEIGHT_STORAGE_VERSION, imported);
    return imported;
  }

  const mode = loadWeightModeFromStorage();
  return readVersionedJson({
    key: LS_WEIGHTS_KEY,
    version: WEIGHT_STORAGE_VERSION,
    fallback: () => (mode === "independent" ? defaultIndependentWeights() : defaultWeights()),
    sanitize: (value) => sanitizeWeights(value, mode),
    migrate: (value) => sanitizeWeights(value, mode),
  });
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
    nomadVisaOnly: p["nomadVisa"] === true,
    schengenOnly: p["schengen"] === true,
    minTouristDays: typeof p["minDays"] === "number" ? p["minDays"] : null,
    selectedRegions: Array.isArray(p["regions"])
      ? new Set(p["regions"].filter((r): r is string => typeof r === "string"))
      : new Set<string>(),
    climatePrefs: {
      seasonType:
        typeof p["climateSeason"] === "string"
          ? (p["climateSeason"] as ClimatePreferences["seasonType"])
          : def.seasonType,
      minTemp: typeof p["climateMin"] === "number" ? p["climateMin"] : def.minTemp,
      maxTemp: typeof p["climateMax"] === "number" ? p["climateMax"] : def.maxTemp,
    },
  };
}

export function loadFiltersFromStorage(): LoadedFilters {
  const def = defaultClimatePreferences();
  const sharedParams = readSharedParams();
  if (sharedParams !== null) {
    const loaded = filtersFromSharedParams(sharedParams, def);
    writeVersionedJson(LS_FILTERS_KEY, FILTER_STORAGE_VERSION, filtersToStorable(loaded));
    return loaded;
  }

  return readVersionedJson({
    key: LS_FILTERS_KEY,
    version: FILTER_STORAGE_VERSION,
    fallback: () => ({
      nomadVisaOnly: false,
      schengenOnly: false,
      minTouristDays: null,
      selectedRegions: new Set<string>(),
      climatePrefs: def,
    }),
    sanitize: (value) =>
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? filtersFromParsed(value as Record<string, unknown>, def)
        : {
            nomadVisaOnly: false,
            schengenOnly: false,
            minTouristDays: null,
            selectedRegions: new Set<string>(),
            climatePrefs: def,
          },
    migrate: (value) =>
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? filtersFromParsed(value as Record<string, unknown>, def)
        : {
            nomadVisaOnly: false,
            schengenOnly: false,
            minTouristDays: null,
            selectedRegions: new Set<string>(),
            climatePrefs: def,
          },
  });
}
