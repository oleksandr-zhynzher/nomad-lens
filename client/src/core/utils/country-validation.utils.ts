import type { CategoryScore, CountryData } from "@core/models";
import { CATEGORY_KEYS } from "@core/models";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isCategoryScore(value: unknown): value is CategoryScore {
  return isRecord(value) && isNumberOrNull(value["value"]) && isRecord(value["indicators"]);
}

function assertOptionalStringArray(value: unknown, path: string) {
  if (value === undefined) return;
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) {
    throw new TypeError(`${path} must be an array of strings`);
  }
}

function assertOptionalNumberRecord(value: unknown, path: string) {
  if (value === undefined) return;
  if (!isRecord(value) || !Object.values(value).every((entry) => typeof entry === "number")) {
    throw new TypeError(`${path} must be a number record`);
  }
}

function validateCountryEntry(entry: Record<string, unknown>, index: number) {
  if (typeof entry["code"] !== "string" || entry["code"].length !== 2) {
    throw new TypeError(`Country entry at index ${index} has an invalid code`);
  }
  if (typeof entry["name"] !== "string" || entry["name"].length === 0) {
    throw new TypeError(`Country entry at index ${index} has an invalid name`);
  }
  if (!isRecord(entry["scores"])) {
    throw new TypeError(`Country entry at index ${index} is missing scores`);
  }
  if (typeof entry["region"] !== "string" || entry["region"].length === 0) {
    throw new TypeError(`Country entry at index ${index} has an invalid region`);
  }
  if (typeof entry["capital"] !== "string") {
    throw new TypeError(`Country entry at index ${index} has an invalid capital`);
  }
  if (typeof entry["flagUrl"] !== "string" || entry["flagUrl"].length === 0) {
    throw new TypeError(`Country entry at index ${index} has an invalid flag URL`);
  }
  if (typeof entry["population"] !== "number" || !Number.isFinite(entry["population"])) {
    throw new TypeError(`Country entry at index ${index} has an invalid population`);
  }
  if (
    entry["touristVisaDays"] !== undefined &&
    entry["touristVisaDays"] !== null &&
    typeof entry["touristVisaDays"] !== "number"
  ) {
    throw new TypeError(`Country entry at index ${index} has invalid tourist visa days`);
  }

  assertOptionalStringArray(entry["tourismTags"], `Country entry at index ${index} tourismTags`);
  assertOptionalNumberRecord(
    entry["tourismTagScores"],
    `Country entry at index ${index} tourismTagScores`,
  );

  for (const key of CATEGORY_KEYS) {
    if (!isCategoryScore(entry["scores"][key])) {
      throw new TypeError(`Country entry at index ${index} has invalid ${key} score`);
    }
  }
}

/** Minimal runtime guard for the countries payload before it enters app state. */
export function parseCountryDataArray(data: unknown): CountryData[] {
  if (!Array.isArray(data)) {
    throw new TypeError("Countries payload must be an array");
  }

  for (const [index, entry] of data.entries()) {
    if (!isRecord(entry)) {
      throw new TypeError(`Country entry at index ${index} must be an object`);
    }
    validateCountryEntry(entry, index);
  }

  return data as CountryData[];
}
