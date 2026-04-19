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
  | "tourismSafety"
  | "accommodationCost"
  | "transportCost"
  | "tourismInfrastructure"
  | "localFriendliness"
  | "nightlifeEntertainment"
  | "touristScamSafety"
  | "streetFoodCuisine"
  | "beachWaterQuality"
  | "walkabilityScenicBeauty"
  | "shoppingMarkets"
  | "photographySpots"
  | "familyFriendliness"
  | "adventureSports"
  | "historicalSites"
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
  "tourismSafety",
  "accommodationCost",
  "transportCost",
  "tourismInfrastructure",
  "localFriendliness",
  "nightlifeEntertainment",
  "touristScamSafety",
  "streetFoodCuisine",
  "beachWaterQuality",
  "walkabilityScenicBeauty",
  "shoppingMarkets",
  "photographySpots",
  "familyFriendliness",
  "adventureSports",
  "historicalSites",
  "nomadCommunity",
  "visaFriendliness",
  "costEfficiency",
  "workLifeBalance",
  "digitalReadiness",
  "culturalFit",
];

/** Tourism subcategory groups — logical groupings of tourism metrics. */
export const TOURISM_GROUPS: Array<{
  labelKey: string;
  keys: CategoryKey[];
}> = [
  {
    labelKey: "safetyPeople",
    keys: [
      "tourismSafety",
      "touristScamSafety",
      "localFriendliness",
      "englishProficiency",
    ],
  },
  {
    labelKey: "sightseeingNature",
    keys: [
      "historicalSites",
      "photographySpots",
      "walkabilityScenicBeauty",
      "beachWaterQuality",
    ],
  },
  {
    labelKey: "activitiesLifestyle",
    keys: [
      "nightlifeEntertainment",
      "streetFoodCuisine",
      "shoppingMarkets",
      "adventureSports",
      "familyFriendliness",
    ],
  },
];

/** Tourism category keys — standalone section, not in main ranking. */
export const TOURISM_CATEGORY_KEYS: CategoryKey[] = TOURISM_GROUPS.flatMap(
  (g) => g.keys,
);

/** AI-analyzed category keys — opt-in only (default weight 0). */
export const AI_CATEGORY_KEYS: CategoryKey[] = [
  "nomadCommunity",
  "visaFriendliness",
  "costEfficiency",
  "workLifeBalance",
  "digitalReadiness",
  "culturalFit",
];

export const CORE_CATEGORY_KEYS: CategoryKey[] = CATEGORY_KEYS.filter(
  (key) =>
    !AI_CATEGORY_KEYS.includes(key) && !TOURISM_CATEGORY_KEYS.includes(key),
);

export const DISPLAYED_CORE_CATEGORY_KEYS: CategoryKey[] = CATEGORY_KEYS.filter(
  (key) =>
    key !== "culturalHeritage" &&
    !AI_CATEGORY_KEYS.includes(key) &&
    !TOURISM_CATEGORY_KEYS.includes(key),
);

/** Categories computed by the server but hidden from the UI. */
export const HIDDEN_CATEGORIES: Set<CategoryKey> = new Set([
  "culturalHeritage",
  "biodiversity",
  "digitalFreedom",
  "governance",
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
  tourismSafety: "Tourism Safety",
  accommodationCost: "Accommodation Cost",
  transportCost: "Transport Cost",
  tourismInfrastructure: "Tourism Infrastructure",
  localFriendliness: "Local Friendliness",
  nightlifeEntertainment: "Nightlife & Entertainment",
  touristScamSafety: "Tourist Scam Safety",
  streetFoodCuisine: "Street Food & Cuisine",
  beachWaterQuality: "Beach & Water Quality",
  walkabilityScenicBeauty: "Walkability & Scenic Beauty",
  shoppingMarkets: "Shopping & Markets",
  photographySpots: "Photography Spots",
  familyFriendliness: "Family Friendliness",
  adventureSports: "Adventure Sports",
  historicalSites: "Historical Sites",
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
  tourismSafety:
    "Personal safety for tourists: crime rates, peacefulness, and political stability",
  accommodationCost:
    "Average accommodation costs for travelers — lower prices score higher",
  transportCost:
    "Local transport and utilities affordability — lower costs score higher",
  tourismInfrastructure:
    "Internet coverage, electricity access, and coworking spaces — practical infrastructure for tourists",
  localFriendliness:
    "English proficiency, social tolerance, and happiness — how welcoming locals are to visitors",
  nightlifeEntertainment:
    "Bars, clubs, live music, festivals, and cultural events — quality and variety of nighttime entertainment",
  touristScamSafety:
    "Safety from tourist scams, overcharging, and fraud — higher scores mean fewer risks",
  streetFoodCuisine:
    "Quality and variety of street food, food markets, and local cuisine reputation",
  beachWaterQuality:
    "Beach quality, water clarity, and Blue Flag status — coastal appeal for visitors",
  walkabilityScenicBeauty:
    "Pedestrian-friendly cities, scenic old towns, viewpoints, and promenades",
  shoppingMarkets:
    "Bazaars, malls, luxury outlets, local crafts, and souvenir shopping opportunities",
  photographySpots:
    "Iconic landmarks, photogenic landscapes, and unique architecture — density of photo-worthy locations",
  familyFriendliness:
    "Kid-friendly attractions, theme parks, safety, and family accommodation",
  adventureSports:
    "Paragliding, bungee, surfing, rafting, zip-lines, trekking, and diving opportunities",
  historicalSites:
    "Ruins, castles, ancient cities, UNESCO heritage density, and archaeological richness",
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
  tourismSafety:
    "UNODC (homicide rate) · IEP Global Peace Index · World Bank WGI (political stability)",
  accommodationCost: "Numbeo · Livingcost.org (monthly rent benchmarks)",
  transportCost: "Numbeo · Livingcost.org (local transport & utilities costs)",
  tourismInfrastructure:
    "World Bank (internet users %, electricity access %) · Numbeo (coworking)",
  localFriendliness:
    "EF EPI (English proficiency) · ILGA/Equaldex (tolerance) · UN WHR (happiness)",
  nightlifeEntertainment:
    "AI composite (TripAdvisor, travel guides, festival data)",
  touristScamSafety: "AI composite (safety indices, travel advisories, Numbeo)",
  streetFoodCuisine: "AI composite (TasteAtlas, TripAdvisor, food guides)",
  beachWaterQuality:
    "AI composite (Blue Flag, TripAdvisor, water quality reports)",
  walkabilityScenicBeauty:
    "AI composite (Walk Score, travel guides, urban planning data)",
  shoppingMarkets: "AI composite (TripAdvisor, travel guides, retail indices)",
  photographySpots: "AI composite (Instagram data, travel guides, UNESCO)",
  familyFriendliness:
    "AI composite (family travel guides, safety data, TripAdvisor)",
  adventureSports:
    "AI composite (adventure tourism data, PADI, trekking guides)",
  historicalSites:
    "AI composite (UNESCO, archaeological databases, travel guides)",
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
  tourismSafety: "TSF",
  accommodationCost: "ACC",
  transportCost: "TRN",
  tourismInfrastructure: "TIF",
  localFriendliness: "FRN",
  nightlifeEntertainment: "NIT",
  touristScamSafety: "SCM",
  streetFoodCuisine: "SFC",
  beachWaterQuality: "BCH",
  walkabilityScenicBeauty: "WLK",
  shoppingMarkets: "SHP",
  photographySpots: "PHO",
  familyFriendliness: "FAM",
  adventureSports: "ADV",
  historicalSites: "HIS",
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

// ─── Cost of Living ───────────────────────────────────────────────────────────

export interface CostOfLivingData {
  code: string;
  rentMajorCity: number | null;
  rentSmallerCity: number | null;
  rent2br: number | null;
  rent3br: number | null;
  groceries: number | null;
  dining: number | null;
  transport: number | null;
  utilities: number | null;
  coworking: number | null;
  healthInsurance: number | null;
  totalBasic: number | null;
  totalComfortable: number | null;
  mealBudget: number | null;
  mealMidRange: number | null;
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
  landlocked?: boolean;
  tourismTags?: string[];
  tourismTagScores?: Record<string, number>;
  tourismTagSeasonality?: Record<string, number[]>;
  nomadVisa?: NomadVisaDetails;
  climateData?: ClimateData;
  costOfLiving?: CostOfLivingData | null;
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
