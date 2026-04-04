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

// ─── Nomad Visa Details ───────────────────────────────────────────────────────

export interface NomadVisaDuration {
  initial: number; // months
  maxExtension: number; // months (0 = no extension)
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
  hottestMonth: number; // 0–11
  coldestMonth: number; // 0–11
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
  isSchengen: boolean;
  touristVisaDays: number | null;
  nomadVisa?: NomadVisaDetails;
  climateData?: ClimateData;
  scores: Record<CategoryKey, CategoryScore>;
  i18n?: {
    ru?: { name?: string; capital?: string };
    ua?: { name?: string; capital?: string };
  };
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

export interface BiodiversityEntry {
  code: string; // ISO alpha-2
  name: string;
  nbi: number; // National Biodiversity Index 0–1
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
