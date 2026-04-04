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
  | "healthcareCost"
  | "nomadCommunity"
  | "visaFriendliness"
  | "costEfficiency"
  | "workLifeBalance"
  | "digitalReadiness"
  | "culturalFit";

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
  "nomadCommunity",
  "visaFriendliness",
  "costEfficiency",
  "workLifeBalance",
  "digitalReadiness",
  "culturalFit",
];

/** AI-analyzed category keys — opt-in only (default weight 0). */
export const AI_CATEGORY_KEYS: CategoryKey[] = [
  "nomadCommunity",
  "visaFriendliness",
  "costEfficiency",
  "workLifeBalance",
  "digitalReadiness",
  "culturalFit",
];

/** Categories computed by the server but hidden from the UI. */
export const HIDDEN_CATEGORIES: Set<CategoryKey> = new Set([
  "culturalHeritage",
  "biodiversity",
  "digitalFreedom",
]);

/** AI metrics are visible but opt-in (default weight = 0). */
export const AI_CATEGORIES: Set<CategoryKey> = new Set(AI_CATEGORY_KEYS);

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
  nomadCommunity: "Nomad & Expat Community",
  visaFriendliness: "Visa & Stay Flexibility",
  costEfficiency: "Nomad Cost-Value Ratio",
  workLifeBalance: "Remote Work & Lifestyle",
  digitalReadiness: "Digital Nomad Infra",
  culturalFit: "Cultural Openness",
};

export const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  economy: "GDP per capita, unemployment rate, income equality (Gini)",
  affordability:
    "Cost of living for visitors: Price Level Ratio (nominal vs. PPP GDP) and nominal GDP per capita — lower prices score higher",
  foodSecurity:
    "Prevalence of undernourishment % (FAO via World Bank, inverted) — lower rates indicate better food security",
  healthcare: "Life expectancy, hospital beds, physicians per 1,000",
  education: "Adult literacy rate, primary school enrollment",
  environment: "Air pollution (PM2.5), CO₂ emissions per capita",
  climate: "Average temperature & precipitation comfort range",
  safety: "Homicide rate, global peace index",
  infrastructure:
    "Internet penetration, electricity access, fixed broadband density",
  happiness: "World Happiness Report ladder score",
  humanDevelopment: "UNDP Human Development Index (HDI)",
  governance:
    "Corruption control, rule of law, political stability, government effectiveness",
  englishProficiency:
    "EF English Proficiency Index 2025 — language accessibility for nomads (123 countries)",
  digitalFreedom:
    "Freedom House Internet Freedom score — censorship, surveillance, and content restrictions",
  personalFreedom:
    "CATO Human Freedom Index personal sub-index — movement, expression, and association",
  logistics:
    "World Bank Logistics Performance Index — customs, infrastructure, and shipping efficiency",
  biodiversity:
    "Protected land area and forest coverage — nature access for nomads",
  socialTolerance:
    "LGBTQ+ rights composite — marriage equality, anti-discrimination protections, and legal status",
  taxFriendliness:
    "Heritage Foundation Tax Burden and tax revenue as % of GDP — lighter-tax countries score higher",
  startupEnvironment:
    "Heritage Foundation Business Freedom — ease of starting and running a business",
  airConnectivity:
    "Air passengers carried and destination countries reachable via direct flights — route connectivity for nomads",
  culturalHeritage:
    "UNESCO World Heritage Sites, Intangible Cultural Heritage elements, and international tourism arrivals",
  healthcareCost:
    "Out-of-pocket health expenditure as % of total — lower costs mean more accessible care",
  nomadCommunity:
    "Coworking density, nomad hub presence, coliving availability, and expat community size",
  visaFriendliness:
    "Tourist visa length, visa-run ease, e-visa availability, nomad visa programs, and paths to residency",
  costEfficiency:
    "Quality of nomad life per dollar — coworking, internet, food, and housing value ratio",
  workLifeBalance:
    "Timezone overlap with US/EU, café culture, outdoor recreation, social scene, and weekend escapes",
  digitalReadiness:
    "Café wifi reliability, mobile data quality, digital payments, eSIM support, and app ecosystem",
  culturalFit:
    "Daily-life friendliness to foreigners, language accessibility, scam prevalence, and bureaucratic ease",
};

export const CATEGORY_DATA_SOURCES: Record<CategoryKey, string> = {
  economy: "World Bank (GDP per capita, unemployment, Gini)",
  affordability:
    "World Bank — Price Level Ratio (NY.GDP.PCAP.CD / NY.GDP.PCAP.PP.CD) + nominal GDP per capita (NY.GDP.PCAP.CD)",
  foodSecurity: "FAO via World Bank — SN.ITK.DEFC.ZS (undernourishment %)",
  healthcare: "WHO · World Bank (life expectancy, hospital beds, physicians)",
  education: "World Bank (literacy rate, school enrollment)",
  environment: "World Bank (PM2.5 air pollution, CO₂ per capita)",
  climate: "Open-Meteo (30-year climate normals — temperature & precipitation)",
  safety: "UNODC (homicide rate) · IEP Global Peace Index",
  infrastructure:
    "World Bank (internet users %, electricity access %, broadband subs/100)",
  happiness: "UN World Happiness Report (Cantril ladder score)",
  humanDevelopment: "UNDP Human Development Index (HDI)",
  governance: "World Bank WGI · Transparency International CPI",
  englishProficiency: "EF English Proficiency Index 2025 (EF Education First)",
  digitalFreedom: "Freedom House — Freedom on the Net 2024",
  personalFreedom: "CATO Institute — Human Freedom Index 2024",
  logistics: "World Bank — Logistics Performance Index (LP.LPI.OVRL.XQ)",
  biodiversity:
    "World Bank (ER.LND.PTLD.ZS protected land, AG.LND.FRST.ZS forest area)",
  socialTolerance: "ILGA World Database · Equaldex",
  taxFriendliness:
    "Heritage Foundation Tax Burden · World Bank (GC.TAX.TOTL.GD.ZS)",
  startupEnvironment: "Heritage Foundation — Business Freedom 2025",
  airConnectivity:
    "World Bank (IS.AIR.PSGR) · OpenFlights (destination countries)",
  culturalHeritage:
    "UNESCO World Heritage Centre · UNESCO ICH · World Bank (ST.INT.ARVL)",
  healthcareCost: "World Bank — SH.XPD.OOPC.CH.ZS (out-of-pocket expenditure)",
  nomadCommunity:
    "AI-analyzed (Claude) — NomadList, Coworker.com, InterNations, UN DESA migrant stock",
  visaFriendliness:
    "AI-analyzed (Claude) — Henley Passport Index, IATA Timatic, NomadList, government sources",
  costEfficiency:
    "AI-analyzed (Claude) — NomadList, Numbeo, Expatistan, Speedtest, Airbnb pricing",
  workLifeBalance:
    "AI-analyzed (Claude) — timezone data, NomadList, TripAdvisor, geographic analysis",
  digitalReadiness:
    "AI-analyzed (Claude) — Speedtest/Ookla, Opensignal, GSMA, NomadList, Airalo",
  culturalFit:
    "AI-analyzed (Claude) — InterNations Expat Insider, NomadList, World Bank, travel advisories",
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
  nomadCommunity: "NMD",
  visaFriendliness: "VIS",
  costEfficiency: "VAL",
  workLifeBalance: "WLB",
  digitalReadiness: "DIG+",
  culturalFit: "FIT",
};

// ─── Nomad Visa Details ───────────────────────────────────────────────────────

export interface NomadVisaDuration {
  initial: number;
  maxExtension: number;
  renewable: boolean;
}

export interface NomadVisaCost {
  currency: string;
  amount: number;
  notes: string;
}

export interface NomadVisaIncomeRequirement {
  currency: string;
  monthly: number | null;
  annual: number | null;
  notes: string;
}

export interface NomadVisaTax {
  status: "exempt" | "standard" | "special";
  rate: number | null;
  notes: string;
}

export interface NomadVisaEligibility {
  minAge: number;
  requirements: string[];
}

export interface NomadVisaApplicationProcess {
  online: boolean;
  processingTime: string;
  documents: string[];
}

export interface NomadVisaLocalization {
  benefits?: string[];
  eligibility?: { requirements?: string[] };
  applicationProcess?: { processingTime?: string; documents?: string[] };
  tax?: { notes?: string };
  cost?: { notes?: string };
  incomeRequirement?: { notes?: string };
}

export interface NomadVisaDetails {
  code: string;
  visaName: string;
  officialUrl: string;
  duration: NomadVisaDuration;
  cost: NomadVisaCost;
  incomeRequirement: NomadVisaIncomeRequirement;
  tax: NomadVisaTax;
  eligibility: NomadVisaEligibility;
  benefits: string[];
  applicationProcess: NomadVisaApplicationProcess;
  lastUpdated: string;
  i18n?: { ru?: NomadVisaLocalization; ua?: NomadVisaLocalization };
}

// ─── Climate ─────────────────────────────────────────────────────────────────

export type SeasonType =
  | "four_seasons"
  | "mild_seasons"
  | "tropical"
  | "arid"
  | "polar";

export interface ClimateData {
  annualMeanTemp: number;
  annualPrecipitation: number;
  tempRange: number;
  hottestMonth: number; // °C – warmest monthly mean
  coldestMonth: number; // °C – coldest monthly mean
  seasonType: SeasonType;
}

export interface ClimatePreferences {
  seasonType: SeasonType | "any";
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
  nomadVisa?: NomadVisaDetails;
  climateData?: ClimateData;
  scores: Record<CategoryKey, CategoryScore>;
  i18n?: {
    ru?: { name?: string; capital?: string };
    ua?: { name?: string; capital?: string };
  };
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
