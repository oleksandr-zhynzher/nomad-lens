import countriesJson from '../data/countries.json';
import type { CategoryScore, CountryData } from '../utils/types';

const CATEGORY_KEYS = [
  'economy',
  'affordability',
  'foodSecurity',
  'healthcare',
  'education',
  'environment',
  'climate',
  'safety',
  'infrastructure',
  'happiness',
  'humanDevelopment',
  'governance',
  'englishProficiency',
  'digitalFreedom',
  'personalFreedom',
  'logistics',
  'biodiversity',
  'socialTolerance',
  'taxFriendliness',
  'startupEnvironment',
  'airConnectivity',
  'culturalHeritage',
  'healthcareCost',
  'tourismSafety',
  'accommodationCost',
  'transportCost',
  'tourismInfrastructure',
  'localFriendliness',
  'nightlifeEntertainment',
  'touristScamSafety',
  'streetFoodCuisine',
  'beachWaterQuality',
  'walkabilityScenicBeauty',
  'shoppingMarkets',
  'photographySpots',
  'familyFriendliness',
  'adventureSports',
  'historicalSites',
  'nomadCommunity',
  'visaFriendliness',
  'costEfficiency',
  'workLifeBalance',
  'digitalReadiness',
  'culturalFit',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isCategoryScore(value: unknown): value is CategoryScore {
  return isRecord(value) && isNumberOrNull(value['value']) && isRecord(value['indicators']);
}

function hasOptionalStringArray(value: unknown): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((entry) => typeof entry === 'string'))
  );
}

function hasOptionalNumberRecord(value: unknown): boolean {
  return (
    value === undefined ||
    (isRecord(value) && Object.values(value).every((entry) => typeof entry === 'number'))
  );
}

function isCountryData(value: unknown): value is CountryData {
  return (
    isRecord(value) &&
    typeof value['code'] === 'string' &&
    value['code'].length === 2 &&
    typeof value['name'] === 'string' &&
    typeof value['region'] === 'string' &&
    value['region'].length > 0 &&
    typeof value['capital'] === 'string' &&
    typeof value['flagUrl'] === 'string' &&
    value['flagUrl'].length > 0 &&
    typeof value['population'] === 'number' &&
    Number.isFinite(value['population']) &&
    hasOptionalStringArray(value['tourismTags']) &&
    hasOptionalNumberRecord(value['tourismTagScores']) &&
    isRecord(value['scores']) &&
    CATEGORY_KEYS.every((key) => isCategoryScore((value['scores'] as Record<string, unknown>)[key]))
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
