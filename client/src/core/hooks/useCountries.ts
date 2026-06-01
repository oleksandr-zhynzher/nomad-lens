import { getCountries, getUserFacingErrorMessage } from "@core/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import type { CountryData } from "../models/country.models";

const countryQueryKey = ["countries"] as const;

interface UseCountriesResult {
  countries: CountryData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCountries(): UseCountriesResult {
  const countriesQuery = useQuery({
    queryKey: countryQueryKey,
    queryFn: async ({ signal }) => getCountries({ signal }),
  });

  const refresh = useCallback(() => {
    void countriesQuery.refetch();
  }, [countriesQuery]);

  return {
    countries: countriesQuery.data ?? [],
    loading: countriesQuery.isLoading || countriesQuery.isFetching,
    error: countriesQuery.error === null ? null : getUserFacingErrorMessage(countriesQuery.error),
    refresh,
  };
}
