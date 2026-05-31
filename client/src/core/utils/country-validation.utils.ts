import type { CountryData } from "@core/models";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Minimal runtime guard for the countries payload before it enters app state. */
export function parseCountryDataArray(data: unknown): CountryData[] {
  if (!Array.isArray(data)) {
    throw new TypeError("Countries payload must be an array");
  }

  for (const [index, entry] of data.entries()) {
    if (!isRecord(entry)) {
      throw new Error(`Country entry at index ${index} must be an object`);
    }
    if (typeof entry["code"] !== "string" || entry["code"].length !== 2) {
      throw new Error(`Country entry at index ${index} has an invalid code`);
    }
    if (typeof entry["name"] !== "string" || entry["name"].length === 0) {
      throw new Error(`Country entry at index ${index} has an invalid name`);
    }
    if (!isRecord(entry["scores"])) {
      throw new Error(`Country entry at index ${index} is missing scores`);
    }
  }

  return data as CountryData[];
}
