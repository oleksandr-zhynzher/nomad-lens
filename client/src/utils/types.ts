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

export const CATEGORY_KEYS: CategoryKey[] = [
  "economy",
  "affordability",
  "foodSecurity",
  "healthcare",
  "education",
  "environment",
  "climate",
  "safety",
  "infrastructure",
  "happiness",
  "humanDevelopment",
  "governance",
  "englishProficiency",
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  economy: "Economy",
  affordability: "Affordability",
  foodSecurity: "Food Security",
  healthcare: "Healthcare",
  education: "Education",
  environment: "Environment",
  climate: "Climate",
  safety: "Safety",
  infrastructure: "Internet & Infra",
  happiness: "Happiness",
  humanDevelopment: "Human Development",
  governance: "Governance",
  englishProficiency: "English Proficiency",
};

export const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  economy: "GDP per capita, unemployment rate, income equality (Gini)",
  affordability: "Cost of living proxy: GDP per capita (PPP, inverted) — lower-income countries tend to offer better value for nomads",
  foodSecurity: "Prevalence of undernourishment % (FAO via World Bank, inverted) — lower rates indicate better food security",
  healthcare: "Life expectancy, hospital beds, physicians per 1,000",
  education: "Adult literacy rate, primary school enrollment",
  environment: "Air pollution (PM2.5), CO₂ emissions per capita",
  climate: "Average temperature & precipitation comfort range",
  safety: "Homicide rate, global peace index",
  infrastructure: "Internet penetration, electricity access, fixed broadband density",
  happiness: "World Happiness Report ladder score",
  humanDevelopment: "UNDP Human Development Index (HDI)",
  governance: "Corruption control, rule of law, political stability, government effectiveness",
  englishProficiency: "EF English Proficiency Index 2025 — language accessibility for nomads (123 countries)",
};

export const CATEGORY_DATA_SOURCES: Record<CategoryKey, string> = {
  economy: "World Bank (GDP per capita, unemployment, Gini)",
  affordability: "World Bank — NY.GDP.PCAP.PP.CD (PPP GDP per capita)",
  foodSecurity: "FAO via World Bank — SN.ITK.DEFC.ZS (undernourishment %)",
  healthcare: "WHO · World Bank (life expectancy, hospital beds, physicians)",
  education: "World Bank (literacy rate, school enrollment)",
  environment: "World Bank (PM2.5 air pollution, CO₂ per capita)",
  climate: "Open-Meteo (30-year climate normals — temperature & precipitation)",
  safety: "UNODC (homicide rate) · IEP Global Peace Index",
  infrastructure: "World Bank (internet users %, electricity access %, broadband subs/100)",
  happiness: "UN World Happiness Report (Cantril ladder score)",
  humanDevelopment: "UNDP Human Development Index (HDI)",
  governance: "World Bank WGI · Transparency International CPI",
  englishProficiency: "EF English Proficiency Index 2025 (EF Education First)",
};

export const CATEGORY_ABBREVS: Record<CategoryKey, string> = {
  economy: "ECO",
  affordability: "AFF",
  foodSecurity: "FOOD",
  healthcare: "HLT",
  education: "EDU",
  environment: "ENV",
  climate: "CLM",
  safety: "SAF",
  infrastructure: "INF",
  happiness: "HAP",
  humanDevelopment: "HDI",
  governance: "GOV",
  englishProficiency: "EPI",
};

// ─── Country ──────────────────────────────────────────────────────────────────

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  population: number;
  flagUrl: string;
  capital: string;
  hasNomadVisa?: boolean;
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
