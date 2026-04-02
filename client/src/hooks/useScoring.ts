import { useMemo } from "react";
import { computeClimateScore, rankCountries } from "../utils/scoring";
import type { ClimatePreferences, CountryData, RankedCountry, WeightMap } from "../utils/types";

export function useScoring(
  countries: CountryData[],
  weights: WeightMap,
  searchQuery: string,
  regionFilter: string,
  nomadVisaOnly: boolean,
  schengenOnly: boolean,
  minTouristDays: number | null,
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
      const matchesSchengen = !schengenOnly || c.isSchengen === true;
      const matchesTouristDays =
        minTouristDays === null ||
        (c.touristVisaDays != null && c.touristVisaDays >= minTouristDays);

      return matchesSearch && matchesRegion && matchesNomadVisa && matchesSchengen && matchesTouristDays;
    });

    // Override climate score with preference-based dynamic score
    const withClimate = filtered.map((c) => {
      if (!c.climateData) return c;
      return {
        ...c,
        scores: {
          ...c.scores,
          climate: {
            ...c.scores.climate,
            value: computeClimateScore(c.climateData, climatePrefs),
          },
        },
      };
    });

    return rankCountries(withClimate, weights);
  }, [countries, weights, searchQuery, regionFilter, nomadVisaOnly, schengenOnly, minTouristDays, climatePrefs]);
}
