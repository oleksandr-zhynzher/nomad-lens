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
  indicators: Record<string, IndicatorValue | undefined>;
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
  "digitalFreedom",
  "personalFreedom",
  "logistics",
  "biodiversity",
  "socialTolerance",
  "taxFriendliness",
  "startupEnvironment",
  "airConnectivity",
  "culturalHeritage",
  "healthcareCost",
];

/** Categories computed by the server but hidden from the UI. */
export const HIDDEN_CATEGORIES: Set<CategoryKey> = new Set([
  "culturalHeritage",
  "biodiversity",
  "digitalFreedom",
]);

/** Only the categories visible in the UI (weights, breakdowns, comparisons). */
export const VISIBLE_CATEGORY_KEYS: CategoryKey[] = CATEGORY_KEYS.filter(
  (k) => !HIDDEN_CATEGORIES.has(k),
);

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
  digitalFreedom: "Digital Freedom",
  personalFreedom: "Personal Freedom",
  logistics: "Logistics & Transport",
  biodiversity: "Biodiversity & Nature",
  socialTolerance: "Social Tolerance",
  taxFriendliness: "Tax Friendliness",
  startupEnvironment: "Startup Environment",
  airConnectivity: "Air Connectivity",
  culturalHeritage: "Cultural Heritage",
  healthcareCost: "Healthcare Cost",
};

export const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  economy: "GDP per capita, unemployment rate, income equality (Gini)",
  affordability: "Cost of living for visitors: Price Level Ratio (nominal vs. PPP GDP) and nominal GDP per capita — lower prices score higher",
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
  digitalFreedom: "Freedom House Internet Freedom score — censorship, surveillance, and content restrictions",
  personalFreedom: "CATO Human Freedom Index personal sub-index — movement, expression, and association",
  logistics: "World Bank Logistics Performance Index — customs, infrastructure, and shipping efficiency",
  biodiversity: "Protected land area and forest coverage — nature access for nomads",
  socialTolerance: "LGBTQ+ rights composite — marriage equality, anti-discrimination protections, and legal status",
  taxFriendliness: "Heritage Foundation Tax Burden and tax revenue as % of GDP — lighter-tax countries score higher",
  startupEnvironment: "Heritage Foundation Business Freedom — ease of starting and running a business",
  airConnectivity: "Air passengers carried and destination countries reachable via direct flights — route connectivity for nomads",
  culturalHeritage: "UNESCO World Heritage Sites, Intangible Cultural Heritage elements, and international tourism arrivals",
  healthcareCost: "Out-of-pocket health expenditure as % of total — lower costs mean more accessible care",
};

export const CATEGORY_DATA_SOURCES: Record<CategoryKey, string> = {
  economy: "World Bank (GDP per capita, unemployment, Gini)",
  affordability: "World Bank — Price Level Ratio (NY.GDP.PCAP.CD / NY.GDP.PCAP.PP.CD) + nominal GDP per capita (NY.GDP.PCAP.CD)",
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
  digitalFreedom: "Freedom House — Freedom on the Net 2024",
  personalFreedom: "CATO Institute — Human Freedom Index 2024",
  logistics: "World Bank — Logistics Performance Index (LP.LPI.OVRL.XQ)",
  biodiversity: "World Bank (ER.LND.PTLD.ZS protected land, AG.LND.FRST.ZS forest area)",
  socialTolerance: "ILGA World Database · Equaldex",
  taxFriendliness: "Heritage Foundation Tax Burden · World Bank (GC.TAX.TOTL.GD.ZS)",
  startupEnvironment: "Heritage Foundation — Business Freedom 2025",
  airConnectivity: "World Bank (IS.AIR.PSGR) · OpenFlights (destination countries)",
  culturalHeritage: "UNESCO World Heritage Centre · UNESCO ICH · World Bank (ST.INT.ARVL)",
  healthcareCost: "World Bank — SH.XPD.OOPC.CH.ZS (out-of-pocket expenditure)",
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
  digitalFreedom: "DIG",
  personalFreedom: "PER",
  logistics: "LOG",
  biodiversity: "BIO",
  socialTolerance: "SOC",
  taxFriendliness: "TAX",
  startupEnvironment: "BIZ",
  airConnectivity: "AIR",
  culturalHeritage: "CUL",
  healthcareCost: "OOP",
};

// ─── Climate ─────────────────────────────────────────────────────────────────

export type SeasonType = 'four_seasons' | 'mild_seasons' | 'tropical' | 'arid' | 'polar';

export interface ClimateData {
  annualMeanTemp: number;
  annualPrecipitation: number;
  tempRange: number;
  hottestMonth: number;
  coldestMonth: number;
  seasonType: SeasonType;
}

export interface ClimatePreferences {
  seasonType: SeasonType | 'any';
  minTemp: number;
  maxTemp: number;
}

// ─── Country ──────────────────────────────────────────────────────────────────

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  population: number;
  flagUrl: string;
  capital: string;
  hasNomadVisa?: boolean;
  isSchengen?: boolean;
  touristVisaDays?: number | null;
  climateData?: ClimateData;
  scores: Record<CategoryKey, CategoryScore>;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export type WeightMode = "independent" | "balanced";

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
