import { getJson } from "@core/api";
import type { CountryData } from "@core/models";

declare global {
  interface Window {
    __NOMAD_LENS_DATA__?: CountryData[];
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export function getCountries(): Promise<CountryData[]> {
  if (window.__NOMAD_LENS_DATA__) {
    return Promise.resolve(window.__NOMAD_LENS_DATA__);
  }

  if (BASE_URL === "") {
    return getJson<CountryData[]>("/countries.json");
  }

  return getJson<CountryData[]>(`${BASE_URL}/api/countries`);
}

export function getHealth(): Promise<{ status: string; apis: Record<string, boolean> }> {
  return getJson(`${BASE_URL}/api/health`);
}
