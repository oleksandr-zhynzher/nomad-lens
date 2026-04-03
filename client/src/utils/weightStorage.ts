import { defaultClimatePreferences, defaultIndependentWeights, defaultWeights } from "./scoring";
import type { ClimatePreferences, WeightMap, WeightMode } from "./types";
import { CATEGORY_KEYS, VISIBLE_CATEGORY_KEYS } from "./types";

export const LS_WEIGHTS_KEY = "nomad-lens:weights";
export const LS_WEIGHT_MODE_KEY = "nomad-lens:weight-mode";
export const LS_FILTERS_KEY = "nomad-lens:filters";

export const WEIGHT_SHARE_KEYS = [
  "nomadVisa", "schengen", "minDays", "regions",
  "climateSeason", "climateMin", "climateMax", "weightMode",
  ...CATEGORY_KEYS,
];

export type LoadedFilters = {
  nomadVisaOnly: boolean;
  schengenOnly: boolean;
  minTouristDays: number | null;
  selectedRegions: Set<string>;
  climatePrefs: ClimatePreferences;
};

export function weightsFromSearch(search: string): WeightMap {
  const params = new URLSearchParams(search);
  const mode = params.get("weightMode") === "balanced" ? "balanced" : "independent";
  const base = mode === "independent" ? defaultIndependentWeights() : defaultWeights();
  let hasParams = false;
  for (const key of CATEGORY_KEYS) {
    const v = params.get(key);
    if (v !== null) {
      const n = Number(v);
      if (!isNaN(n)) { base[key] = Math.max(0, Math.min(100, n)); hasParams = true; }
    }
  }
  if (!hasParams) return base;
  if (mode === "balanced") {
    const visibleSum = VISIBLE_CATEGORY_KEYS.reduce((s, k) => s + base[k], 0);
    if (visibleSum !== 0 && visibleSum !== 100) {
      const scale = 100 / visibleSum;
      const exactShares = VISIBLE_CATEGORY_KEYS.map((k) => base[k] * scale);
      const floors = exactShares.map((s) => Math.floor(s));
      const floorSum = floors.reduce((a, b) => a + b, 0);
      let leftover = 100 - floorSum;
      const remainders = exactShares.map((s, i) => ({ i, r: s - floors[i] }));
      remainders.sort((a, b) => b.r - a.r);
      remainders.forEach(({ i }) => { if (leftover > 0) { floors[i]++; leftover--; } });
      VISIBLE_CATEGORY_KEYS.forEach((k, i) => { base[k] = floors[i]; });
    }
  }
  return base;
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
  const urlParams = new URLSearchParams(window.location.search);
  const hasShared =
    CATEGORY_KEYS.some((k) => urlParams.has(k)) ||
    ["nomadVisa", "schengen", "minDays", "regions", "climateSeason", "climateMin", "climateMax", "weightMode"].some(
      (k) => urlParams.has(k),
    );
  if (!hasShared) return null;

  // Strip only weight/filter params, preserve others (c, m, etc.)
  const cleaned = new URLSearchParams(window.location.search);
  for (const k of [
    ...CATEGORY_KEYS,
    "nomadVisa", "schengen", "minDays", "regions",
    "climateSeason", "climateMin", "climateMax", "weightMode",
  ]) {
    cleaned.delete(k);
  }
  const newSearch = cleaned.toString();
  window.history.replaceState(null, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
  return urlParams;
}

// Module-level: consumed once on first import, shared across all pages.
const _sharedParams = consumeSharedParams();

export function loadWeightModeFromStorage(): WeightMode {
  if (_sharedParams?.get("weightMode") === "balanced") {
    try { localStorage.setItem(LS_WEIGHT_MODE_KEY, "balanced"); } catch { /* ignore */ }
    return "balanced";
  }
  if (_sharedParams?.get("weightMode") === "independent") {
    try { localStorage.setItem(LS_WEIGHT_MODE_KEY, "independent"); } catch { /* ignore */ }
    return "independent";
  }
  try {
    const raw = localStorage.getItem(LS_WEIGHT_MODE_KEY);
    if (raw === "balanced" || raw === "independent") return raw;
  } catch { /* ignore */ }
  return "independent";
}

export function loadWeightsFromStorage(): WeightMap {
  if (_sharedParams && CATEGORY_KEYS.some((k) => _sharedParams.has(k))) {
    const imported = weightsFromSearch(_sharedParams.toString());
    try { localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(imported)); } catch { /* ignore */ }
    return imported;
  }
  try {
    const raw = localStorage.getItem(LS_WEIGHTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const mode = loadWeightModeFromStorage();
      const base = mode === "independent" ? defaultIndependentWeights() : defaultWeights();
      for (const key of CATEGORY_KEYS) {
        const v = parsed[key];
        if (typeof v === "number" && !isNaN(v)) {
          base[key] = Math.max(0, Math.min(100, Math.round(v)));
        }
      }
      return base;
    }
  } catch { /* ignore */ }
  const mode = loadWeightModeFromStorage();
  return mode === "independent" ? defaultIndependentWeights() : defaultWeights();
}

export function loadFiltersFromStorage(): LoadedFilters {
  const def = defaultClimatePreferences();
  if (_sharedParams) {
    const minDaysStr = _sharedParams.get("minDays");
    const regionsStr = _sharedParams.get("regions");
    const loaded: LoadedFilters = {
      nomadVisaOnly: _sharedParams.get("nomadVisa") === "1",
      schengenOnly: _sharedParams.get("schengen") === "1",
      minTouristDays:
        minDaysStr !== null && !isNaN(Number(minDaysStr)) ? Number(minDaysStr) : null,
      selectedRegions: regionsStr
        ? new Set(regionsStr.split(",").filter(Boolean))
        : new Set<string>(),
      climatePrefs: {
        seasonType: ((_sharedParams.get("climateSeason") ?? def.seasonType) as ClimatePreferences["seasonType"]),
        minTemp:
          _sharedParams.has("climateMin") && !isNaN(Number(_sharedParams.get("climateMin")))
            ? Number(_sharedParams.get("climateMin"))
            : def.minTemp,
        maxTemp:
          _sharedParams.has("climateMax") && !isNaN(Number(_sharedParams.get("climateMax")))
            ? Number(_sharedParams.get("climateMax"))
            : def.maxTemp,
      },
    };
    try { localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filtersToStorable(loaded))); } catch { /* ignore */ }
    return loaded;
  }
  try {
    const raw = localStorage.getItem(LS_FILTERS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
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
  } catch { /* ignore */ }
  return {
    nomadVisaOnly: false,
    schengenOnly: false,
    minTouristDays: null,
    selectedRegions: new Set<string>(),
    climatePrefs: def,
  };
}
