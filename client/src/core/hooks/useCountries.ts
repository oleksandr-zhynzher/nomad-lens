import { useCallback, useEffect } from "react";

import type { CountryData } from "../models/country.models";
import {
  selectCountries,
  selectCountryError,
  selectCountryStatus,
  selectLoadCountries,
  selectRefreshCountries,
} from "../store/country.selectors";
import { useCountryStore } from "../store/country.store";

interface UseCountriesResult {
  countries: CountryData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCountries(): UseCountriesResult {
  const countries = useCountryStore(selectCountries);
  const status = useCountryStore(selectCountryStatus);
  const error = useCountryStore(selectCountryError);
  const loadCountries = useCountryStore(selectLoadCountries);
  const refreshCountries = useCountryStore(selectRefreshCountries);

  useEffect(() => {
    void loadCountries();
  }, [loadCountries]);

  const refresh = useCallback(() => {
    void refreshCountries();
  }, [refreshCountries]);

  return {
    countries,
    loading: status === "idle" || status === "loading",
    error,
    refresh,
  };
}
