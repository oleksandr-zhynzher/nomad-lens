import { getJson } from "@core/api";
import type { ApiHealthResponse, CountryData } from "@core/models";
import { parseCountryDataArray } from "@core/utils";

declare global {
  interface Window {
    __NOMAD_LENS_DATA__?: CountryData[];
  }
}

const BASE_URL: string = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

interface CountryRequestOptions {
  readonly signal?: AbortSignal;
}

function countryRequestInit(options: CountryRequestOptions) {
  return {
    label: "country data",
    validate: isCountryDataArray,
    ...(options.signal !== undefined ? { signal: options.signal } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCountryDataArray(value: unknown): value is CountryData[] {
  try {
    parseCountryDataArray(value);
    return true;
  } catch {
    return false;
  }
}

function isApiHealthResponse(value: unknown): value is ApiHealthResponse {
  return (
    isRecord(value) &&
    (value["status"] === "ok" || value["status"] === "degraded") &&
    isRecord(value["apis"]) &&
    typeof value["timestamp"] === "string"
  );
}

export async function getCountries(options: CountryRequestOptions = {}): Promise<CountryData[]> {
  if (typeof window !== "undefined" && window.__NOMAD_LENS_DATA__) {
    if (!isCountryDataArray(window.__NOMAD_LENS_DATA__)) {
      throw new Error("Invalid bootstrapped country data");
    }

    return window.__NOMAD_LENS_DATA__;
  }

  if (BASE_URL === "") {
    return getJson<CountryData[]>("/countries.json", countryRequestInit(options));
  }

  return getJson<CountryData[]>(`${BASE_URL}/api/countries`, countryRequestInit(options));
}

export async function getHealth(): Promise<ApiHealthResponse> {
  return getJson<ApiHealthResponse>(`${BASE_URL}/api/health`, {
    label: "health",
    validate: isApiHealthResponse,
  });
}
