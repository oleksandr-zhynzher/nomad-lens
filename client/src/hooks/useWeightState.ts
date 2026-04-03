import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultClimatePreferences, defaultIndependentWeights, defaultWeights, redistributeWeights } from "../utils/scoring";
import type { CategoryKey, ClimatePreferences, WeightMap, WeightMode } from "../utils/types";
import { CATEGORY_KEYS } from "../utils/types";
import {
  filtersToStorable,
  LS_FILTERS_KEY,
  LS_WEIGHT_MODE_KEY,
  LS_WEIGHTS_KEY,
  loadFiltersFromStorage,
  loadWeightModeFromStorage,
  loadWeightsFromStorage,
  weightsToSearch,
} from "../utils/weightStorage";

/** Encapsulates all weight/filter/mode state that is shared across list, map, and compare pages. */
export function useWeightState() {
  const [weights, setWeights] = useState<WeightMap>(loadWeightsFromStorage);
  const [weightMode, setWeightMode] = useState<WeightMode>(loadWeightModeFromStorage);
  const [nomadVisaOnly, setNomadVisaOnly] = useState(() => loadFiltersFromStorage().nomadVisaOnly);
  const [schengenOnly, setSchengenOnly] = useState(() => loadFiltersFromStorage().schengenOnly);
  const [minTouristDays, setMinTouristDays] = useState<number | null>(() => loadFiltersFromStorage().minTouristDays);
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(() => loadFiltersFromStorage().selectedRegions);
  const [climatePrefs, setClimatePrefs] = useState<ClimatePreferences>(() => loadFiltersFromStorage().climatePrefs);

  // Persist weights to localStorage
  useEffect(() => {
    localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
  }, [weights]);
  useEffect(() => {
    localStorage.setItem(LS_WEIGHT_MODE_KEY, weightMode);
  }, [weightMode]);

  // Persist filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_FILTERS_KEY,
        JSON.stringify(
          filtersToStorable({ nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs }),
        ),
      );
    } catch { /* ignore */ }
  }, [nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs]);

  const handleWeightChange = useCallback(
    (key: CategoryKey, value: number) => {
      setWeights((prev) => {
        if (weightMode === "independent") {
          return { ...prev, [key]: Math.max(0, Math.min(100, Math.round(value))) };
        }
        return redistributeWeights(key, value, prev);
      });
    },
    [weightMode],
  );

  const handleReset = useCallback(() => {
    setWeights(weightMode === "independent" ? defaultIndependentWeights() : defaultWeights());
    setNomadVisaOnly(false);
    setSchengenOnly(false);
    setMinTouristDays(null);
    setSelectedRegions(new Set());
    setClimatePrefs(defaultClimatePreferences());
  }, [weightMode]);

  const handleWeightModeChange = useCallback((mode: WeightMode) => {
    setWeightMode(mode);
    setWeights(mode === "independent" ? defaultIndependentWeights() : defaultWeights());
  }, []);

  const weightsAreDefault = useMemo(() => {
    const def = weightMode === "independent" ? defaultIndependentWeights() : defaultWeights();
    const defClimate = defaultClimatePreferences();
    return (
      CATEGORY_KEYS.every((k) => weights[k] === def[k]) &&
      !nomadVisaOnly && !schengenOnly && minTouristDays === null &&
      selectedRegions.size === 0 &&
      climatePrefs.seasonType === defClimate.seasonType &&
      climatePrefs.minTemp === defClimate.minTemp &&
      climatePrefs.maxTemp === defClimate.maxTemp
    );
  }, [weights, weightMode, nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs]);

  const buildShareUrl = useCallback(
    (extraParams?: URLSearchParams) => {
      const params = new URLSearchParams(weightsToSearch(weights));
      if (weightMode !== "independent") params.set("weightMode", weightMode);
      if (nomadVisaOnly) params.set("nomadVisa", "1");
      if (schengenOnly) params.set("schengen", "1");
      if (minTouristDays !== null) params.set("minDays", String(minTouristDays));
      if (selectedRegions.size > 0) params.set("regions", [...selectedRegions].join(","));
      const defClimate = defaultClimatePreferences();
      if (climatePrefs.seasonType !== defClimate.seasonType) params.set("climateSeason", climatePrefs.seasonType);
      if (climatePrefs.minTemp !== defClimate.minTemp) params.set("climateMin", String(climatePrefs.minTemp));
      if (climatePrefs.maxTemp !== defClimate.maxTemp) params.set("climateMax", String(climatePrefs.maxTemp));
      // Merge extra params (e.g. c=, m= from compare page)
      extraParams?.forEach((v, k) => params.set(k, v));
      return window.location.origin + window.location.pathname + "?" + params.toString();
    },
    [weights, weightMode, nomadVisaOnly, schengenOnly, minTouristDays, selectedRegions, climatePrefs],
  );

  const handleShare = useCallback(
    (extraParams?: URLSearchParams) => {
      const url = buildShareUrl(extraParams);
      navigator.clipboard.writeText(url).catch(() => {
        const el = document.createElement("textarea");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      });
    },
    [buildShareUrl],
  );

  return {
    weights, setWeights,
    weightMode, setWeightMode,
    nomadVisaOnly, setNomadVisaOnly,
    schengenOnly, setSchengenOnly,
    minTouristDays, setMinTouristDays,
    selectedRegions, setSelectedRegions,
    climatePrefs, setClimatePrefs,
    weightsAreDefault,
    handleWeightChange,
    handleReset,
    handleWeightModeChange,
    handleShare,
    buildShareUrl,
  };
}
