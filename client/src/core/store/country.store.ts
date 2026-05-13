import { createAppStore } from "@app/store/createStore";
import { getCountries } from "@core/api";
import type { CountryData } from "../models/country.models";

export type CountryLoadStatus = "idle" | "loading" | "success" | "error";

export interface CountryStoreState {
  countries: CountryData[];
  status: CountryLoadStatus;
  error: string | null;
  loadCountries: () => Promise<void>;
  refreshCountries: () => Promise<void>;
}

let inFlightCountriesRequest: Promise<CountryData[]> | null = null;

export const useCountryStore = createAppStore<CountryStoreState>((set, get) => ({
  countries: [],
  status: "idle",
  error: null,

  async loadCountries() {
    const { countries, status } = get();
    if (status === "success" && countries.length > 0) return;

    set({ status: "loading", error: null });

    try {
      const loadedCountries = await requestCountries();
      set({ countries: loadedCountries, status: "success", error: null });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load country data",
      });
    }
  },

  async refreshCountries() {
    set({ status: "loading", error: null });

    try {
      const loadedCountries = await requestCountries({ force: true });
      set({ countries: loadedCountries, status: "success", error: null });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to refresh country data",
      });
    }
  },
}));

function requestCountries({ force = false }: { force?: boolean } = {}): Promise<CountryData[]> {
  if (!force && inFlightCountriesRequest) return inFlightCountriesRequest;

  inFlightCountriesRequest = getCountries().finally(() => {
    inFlightCountriesRequest = null;
  });

  return inFlightCountriesRequest;
}
