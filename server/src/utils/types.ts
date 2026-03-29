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
  | "healthcare"
  | "education"
  | "environment"
  | "climate"
  | "safety"
  | "infrastructure"
  | "happiness"
  | "humanDevelopment";

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

// ─── World Bank ───────────────────────────────────────────────────────────────

export interface WorldBankIndicatorMap {
  [countryCode: string]: {
    [indicatorCode: string]: { value: number | null; year: number };
  };
}

// ─── REST Countries ───────────────────────────────────────────────────────────

export interface RestCountry {
  cca2: string;
  name: { common: string };
  region: string;
  population: number;
  flags: { svg: string; png: string };
  capital?: string[];
  capitalInfo?: { latlng?: [number, number] };
  latlng?: [number, number];
}

// ─── Open-Meteo ───────────────────────────────────────────────────────────────

export interface OpenMeteoClimate {
  annualMeanTemp: number; // °C
  annualPrecipitation: number; // mm
}

// ─── WHO GHO ─────────────────────────────────────────────────────────────────

export interface WhoIndicatorValue {
  SpatialDim: string; // country ISO3
  TimeDim: number; // year
  NumericValue: number | null;
}
