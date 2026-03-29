// ─── Indicator ────────────────────────────────────────────────────────────────

export interface IndicatorValue {
  raw: number;
  unit: string;
  year: number;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryScore {
  /** Normalized 0–100 composite score for this category. null = data unavailable. */
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

export const CATEGORY_KEYS: CategoryKey[] = [
  "economy",
  "healthcare",
  "education",
  "environment",
  "climate",
  "safety",
  "infrastructure",
  "happiness",
  "humanDevelopment",
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  economy: "Economy",
  healthcare: "Healthcare",
  education: "Education",
  environment: "Environment",
  climate: "Climate",
  safety: "Safety",
  infrastructure: "Internet & Infra",
  happiness: "Happiness",
  humanDevelopment: "Human Development",
};

export const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  economy: "GDP per capita, unemployment rate, income equality (Gini)",
  healthcare: "Life expectancy, hospital beds, physicians per 1,000",
  education: "Adult literacy rate, primary school enrollment",
  environment: "Air pollution (PM2.5), CO₂ emissions per capita",
  climate: "Average temperature & precipitation comfort range",
  safety: "Homicide rate, global peace index",
  infrastructure: "Internet penetration, electricity access",
  happiness: "World Happiness Report ladder score",
  humanDevelopment: "UNDP Human Development Index (HDI)",
};

// ─── Country ──────────────────────────────────────────────────────────────────

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  population: number;
  flagUrl: string;
  capital: string;
  scores: Record<CategoryKey, CategoryScore>;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export type WeightMap = Record<CategoryKey, number>;

export interface RankedCountry {
  country: CountryData;
  finalScore: number;
  rank: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiHealthResponse {
  status: "ok" | "degraded";
  apis: Record<string, boolean>;
  timestamp: string;
}
