import type { CountryData } from "../utils/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getCountries(): Promise<CountryData[]> {
    if (window.__NOMAD_LENS_DATA__) {
      return Promise.resolve(window.__NOMAD_LENS_DATA__);
    }
    return get<CountryData[]>("/api/countries");
  },

  getHealth(): Promise<{ status: string; apis: Record<string, boolean> }> {
    return get("/api/health");
  },
};
