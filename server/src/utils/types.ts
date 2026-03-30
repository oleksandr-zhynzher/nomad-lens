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
  | "englishProficiency";

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
