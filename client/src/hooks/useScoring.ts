import { useMemo } from "react";
import { applyClimatePrefs, rankCountries } from "../utils/scoring";
import type { ClimatePreferences, CountryData, RankedCountry, WeightMap } from "../utils/types";

export function useScoring(
  countries: CountryData[],
  weights: WeightMap,
  searchQuery: string,
  regionFilter: string,
  nomadVisaOnly: boolean,
  climatePrefs: ClimatePreferences,
): RankedCountry[] {
  return useMemo(() => {
    const filtered = countries.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion =
        regionFilter === "" || c.region === regionFilter;

      const matchesNomadVisa = !nomadVisaOnly || c.hasNomadVisa === true;

      return matchesSearch && matchesRegion && matchesNomadVisa;
    });

    // Override climate score with preference-based dynamic score
    const withClimate = applyClimatePrefs(filtered, climatePrefs);

    return rankCountries(withClimate, weights);
  }, [countries, weights, searchQuery, regionFilter, nomadVisaOnly, climatePrefs]);
}
