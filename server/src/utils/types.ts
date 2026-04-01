// ─── Indicator ────────────────────────────────────────────────────────────────

export interface IndicatorValue {
  raw: number;
  unit: string;
  year: number;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryScore {
  /** Normalized 0–100 composite score. null = data unavailable. */
  value: number | null;
  indicators: Record<string, IndicatorValue>;
}

export type CategoryKey =
  | "economy"
  | "affordability"
  | "foodSecurity"
  | "healthcare"
  | "education"
  | "environment"
  | "climate"
  | "safety"
  | "infrastructure"
  | "happiness"
  | "humanDevelopment"
  | "governance"
  | "englishProficiency"
  | "digitalFreedom"
  | "personalFreedom"
  | "logistics"
  | "biodiversity"
  | "socialTolerance"
  | "taxFriendliness"
  | "startupEnvironment"
  | "airConnectivity"
  | "culturalHeritage"
  | "healthcareCost";

// ─── Climate ─────────────────────────────────────────────────────────────────

export type SeasonType = 'four_seasons' | 'mild_seasons' | 'tropical' | 'arid' | 'polar';

export interface ClimateData {
  annualMeanTemp: number;
  annualPrecipitation: number;
  tempRange: number;
  hottestMonth: number;  // 0–11
  coldestMonth: number;  // 0–11
  seasonType: SeasonType;
}

// ─── Country ──────────────────────────────────────────────────────────────────

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  population: number;
  flagUrl: string;
  capital: string;
  lat: number;
  lng: number;
  hasNomadVisa: boolean;
  climateData?: ClimateData;
  scores: Record<CategoryKey, CategoryScore>;
}

// ─── Local JSON schemas ────────────────────────────────────────────────────────

export interface HdiEntry {
  code: string; // ISO alpha-2
  name: string;
  hdi: number; // 0–1
  year: number;
}

export interface HappinessEntry {
  code: string;
  name: string;
  score: number; // ~1–8 (Cantril ladder)
  year: number;
}

export interface PeaceEntry {
  code: string;
  name: string;
  score: number; // lower = more peaceful, typically 1–4
  rank: number;
  year: number;
}

export interface CrimeEntry {
  code: string;
  name: string;
  homicideRate: number; // per 100,000 population
  year: number;
}

export interface CpiEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 0-100, higher = less corrupt
  rank: number;
  year: number;
}

export interface EpiEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 200-800, higher = better proficiency
  rank: number;
  year: number;
}

export interface DigitalFreedomEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 0-100, higher = more free
  year: number;
}

export interface PersonalFreedomEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 0-10, higher = more free
  year: number;
}

export interface SocialToleranceEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 0-100, higher = more tolerant
  year: number;
}

export interface TaxBurdenEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 0-100, higher = lighter tax burden
  year: number;
}

export interface StartupEntry {
  code: string; // ISO alpha-2
  name: string;
  score: number; // 0-100, higher = better business environment
  year: number;
}

export interface AirportEntry {
  code: string; // ISO alpha-2
  name: string;
  destinationCountries: number;
  year: number;
}

export interface HeritageEntry {
  code: string; // ISO alpha-2
  name: string;
  sites: number; // UNESCO World Heritage site count
  year: number;
}

export interface IntangibleHeritageEntry {
  code: string; // ISO alpha-2
  name: string;
  elements: number; // UNESCO Intangible Cultural Heritage elements
  year: number;
}

// ─── Open-Meteo ──────────────────────────────────────────────────────────────

/** Alias so openMeteo.ts can use the same shape */
export type OpenMeteoClimate = ClimateData;

// ─── World Bank ───────────────────────────────────────────────────────────────

export interface WorldBankIndicatorMap {
  [countryCode: string]: {
    [indicatorCode: string]: { value: number | null; year: number };
  };
}

// ─── REST Countries ───────────────────────────────────────────────────────────

export interface RestCountry {
  cca2: string;
  cca3?: string;
  name: { common: string };
  region: string;
  subregion?: string;
  population: number;
  flags: { svg: string; png: string };
  capital?: string[];
  capitalInfo?: { latlng?: [number, number] };
  latlng?: [number, number];
}

// ─── WHO GHO ─────────────────────────────────────────────────────────────────

export interface WhoIndicatorValue {
  SpatialDim: string; // country ISO3
  TimeDim: number; // year
  NumericValue: number | null;
}
