import { useEffect, useRef, useState } from "react";
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

  const load = () => {
    cancelRef.current = false;
    setLoading(true);
    setError(null);

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
  };

  useEffect(() => {
    load();
    return () => {
      cancelRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { countries, loading, error, refresh: load };
}
