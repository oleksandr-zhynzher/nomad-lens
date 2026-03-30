import { useMemo } from "react";
import { rankCountries } from "../utils/scoring";
import type { CountryData, RankedCountry, WeightMap } from "../utils/types";

export function useScoring(
  countries: CountryData[],
  weights: WeightMap,
  searchQuery: string,
  regionFilter: string,
  nomadVisaOnly: boolean,
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

    return rankCountries(filtered, weights);
  }, [countries, weights, searchQuery, regionFilter, nomadVisaOnly]);
}
