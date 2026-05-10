import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { CountryData } from "../utils/types";

interface UseCountriesResult {
  countries: CountryData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const fetchCountries = useCallback(() => {
    api
      .getCountries()
      .then((data) => {
        if (!cancelRef.current) {
          setCountries(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoading(false);
        }
      });
  }, []);

  const load = useCallback(() => {
    cancelRef.current = false;
    setLoading(true);
    setError(null);
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    cancelRef.current = false;
    fetchCountries();
    return () => {
      cancelRef.current = true;
    };
  }, [fetchCountries]);

  return { countries, loading, error, refresh: load };
}
