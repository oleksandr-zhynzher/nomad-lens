import countriesJson from '../data/countries.json';
import type { CountryData } from '../utils/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCountryData(value: unknown): value is CountryData {
  return (
    isRecord(value) &&
    typeof value['code'] === 'string' &&
    typeof value['name'] === 'string' &&
    typeof value['region'] === 'string' &&
    typeof value['population'] === 'number' &&
    isRecord(value['scores'])
  );
}

function loadCountriesData(): CountryData[] {
  const parsed = countriesJson as unknown;
  if (!Array.isArray(parsed) || !parsed.every(isCountryData)) {
    throw new Error('Invalid countries data file.');
  }

  return parsed;
}

const countriesData = loadCountriesData();

export function getCountriesData(): readonly CountryData[] {
  return countriesData;
}

export function getCountriesDataStatus(): { readonly count: number; readonly loaded: boolean } {
  return {
    count: countriesData.length,
    loaded: countriesData.length > 0,
  };
}
