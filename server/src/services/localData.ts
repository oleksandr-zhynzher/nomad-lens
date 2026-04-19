import hdiJson from "../data/hdi.json";
import happinessJson from "../data/happiness.json";
import peaceJson from "../data/peace.json";
import crimeJson from "../data/crime.json";
import cpiJson from "../data/cpi.json";
import epiJson from "../data/epi.json";
import nomadVisaJson from "../data/nomadVisa.json";
import nomadVisaDetailsJson from "../data/nomadVisaDetails.json";
import visasJson from "../data/visas.json";
import digitalFreedomJson from "../data/digitalFreedom.json";
import personalFreedomJson from "../data/personalFreedom.json";
import socialToleranceJson from "../data/socialTolerance.json";
import taxBurdenJson from "../data/taxBurden.json";
import startupEnvironmentJson from "../data/startupEnvironment.json";
import airportsJson from "../data/airports.json";
import culturalHeritageJson from "../data/culturalHeritage.json";
import intangibleHeritageJson from "../data/intangibleHeritage.json";
import biodiversityJson from "../data/biodiversity.json";
import aiMetricsJson from "../data/ai-metrics.json";
import tourismAiMetricsJson from "../data/tourism-ai-metrics.json";
import costOfLivingJson from "../data/costOfLiving.json";
import type {
  HdiEntry,
  HappinessEntry,
  PeaceEntry,
  CrimeEntry,
  CpiEntry,
  EpiEntry,
  DigitalFreedomEntry,
  PersonalFreedomEntry,
  SocialToleranceEntry,
  TaxBurdenEntry,
  StartupEntry,
  AirportEntry,
  HeritageEntry,
  IntangibleHeritageEntry,
  BiodiversityEntry,
  NomadVisaDetails,
  AiMetricsEntry,
  TourismAiMetricsEntry,
  CostOfLivingEntry,
} from "../utils/types";

type JsonFile<T> = { data: T[] };

const hdiMap = new Map<string, HdiEntry>();
const happinessMap = new Map<string, HappinessEntry>();
const peaceMap = new Map<string, PeaceEntry>();
const crimeMap = new Map<string, CrimeEntry>();
const cpiMap = new Map<string, CpiEntry>();
const epiMap = new Map<string, EpiEntry>();
const digitalFreedomMap = new Map<string, DigitalFreedomEntry>();
const personalFreedomMap = new Map<string, PersonalFreedomEntry>();
const socialToleranceMap = new Map<string, SocialToleranceEntry>();
const taxBurdenMap = new Map<string, TaxBurdenEntry>();
const startupMap = new Map<string, StartupEntry>();
const airportMap = new Map<string, AirportEntry>();
const heritageMap = new Map<string, HeritageEntry>();
const intangibleHeritageMap = new Map<string, IntangibleHeritageEntry>();
const biodiversityMap = new Map<string, BiodiversityEntry>();
const aiMetricsMap = new Map<string, AiMetricsEntry>();
const tourismAiMetricsMap = new Map<string, TourismAiMetricsEntry>();
const costOfLivingMap = new Map<string, CostOfLivingEntry>();

const nomadVisaSet = new Set<string>(nomadVisaJson.countries);
const nomadVisaDetailsMap = new Map<string, NomadVisaDetails>();
(nomadVisaDetailsJson as unknown as NomadVisaDetails[]).forEach((e) =>
  nomadVisaDetailsMap.set(e.code.toUpperCase(), e),
);
const schengenSet = new Set<string>(visasJson.schengen);
const touristVisaDaysMap = visasJson.touristVisaDays as Record<
  string,
  number | null
>;

(hdiJson as unknown as JsonFile<HdiEntry>).data.forEach((e) =>
  hdiMap.set(e.code, e),
);
(happinessJson as unknown as JsonFile<HappinessEntry>).data.forEach((e) =>
  happinessMap.set(e.code, e),
);
(peaceJson as unknown as JsonFile<PeaceEntry>).data.forEach((e) =>
  peaceMap.set(e.code, e),
);
(crimeJson as unknown as JsonFile<CrimeEntry>).data.forEach((e) =>
  crimeMap.set(e.code, e),
);
(cpiJson as unknown as JsonFile<CpiEntry>).data.forEach((e) =>
  cpiMap.set(e.code, e),
);
(epiJson as unknown as JsonFile<EpiEntry>).data.forEach((e) =>
  epiMap.set(e.code, e),
);
(digitalFreedomJson as unknown as JsonFile<DigitalFreedomEntry>).data.forEach(
  (e) => digitalFreedomMap.set(e.code, e),
);
(personalFreedomJson as unknown as JsonFile<PersonalFreedomEntry>).data.forEach(
  (e) => personalFreedomMap.set(e.code, e),
);
(socialToleranceJson as unknown as JsonFile<SocialToleranceEntry>).data.forEach(
  (e) => socialToleranceMap.set(e.code, e),
);
(taxBurdenJson as unknown as JsonFile<TaxBurdenEntry>).data.forEach((e) =>
  taxBurdenMap.set(e.code, e),
);
(startupEnvironmentJson as unknown as JsonFile<StartupEntry>).data.forEach(
  (e) => startupMap.set(e.code, e),
);
(airportsJson as unknown as JsonFile<AirportEntry>).data.forEach((e) =>
  airportMap.set(e.code, e),
);
(culturalHeritageJson as unknown as JsonFile<HeritageEntry>).data.forEach((e) =>
  heritageMap.set(e.code, e),
);
(
  intangibleHeritageJson as unknown as JsonFile<IntangibleHeritageEntry>
).data.forEach((e) => intangibleHeritageMap.set(e.code, e));
(biodiversityJson as unknown as JsonFile<BiodiversityEntry>).data.forEach((e) =>
  biodiversityMap.set(e.code, e),
);
(aiMetricsJson as unknown as JsonFile<AiMetricsEntry>).data.forEach((e) =>
  aiMetricsMap.set(e.code.toUpperCase(), e),
);
(
  tourismAiMetricsJson as unknown as JsonFile<TourismAiMetricsEntry>
).data.forEach((e) => tourismAiMetricsMap.set(e.code.toUpperCase(), e));
(costOfLivingJson as unknown as JsonFile<CostOfLivingEntry>).data.forEach((e) =>
  costOfLivingMap.set(e.code.toUpperCase(), e),
);

export const localData = {
  getHdi: (code: string): HdiEntry | undefined => hdiMap.get(code),
  getHappiness: (code: string): HappinessEntry | undefined =>
    happinessMap.get(code),
  getPeace: (code: string): PeaceEntry | undefined => peaceMap.get(code),
  getCrime: (code: string): CrimeEntry | undefined => crimeMap.get(code),
  getCpi: (code: string): CpiEntry | undefined => cpiMap.get(code),
  getEpi: (code: string): EpiEntry | undefined => epiMap.get(code),
  getDigitalFreedom: (code: string): DigitalFreedomEntry | undefined =>
    digitalFreedomMap.get(code),
  getPersonalFreedom: (code: string): PersonalFreedomEntry | undefined =>
    personalFreedomMap.get(code),
  getSocialTolerance: (code: string): SocialToleranceEntry | undefined =>
    socialToleranceMap.get(code),
  getTaxBurden: (code: string): TaxBurdenEntry | undefined =>
    taxBurdenMap.get(code),
  getStartup: (code: string): StartupEntry | undefined => startupMap.get(code),
  getAirport: (code: string): AirportEntry | undefined => airportMap.get(code),
  getHeritage: (code: string): HeritageEntry | undefined =>
    heritageMap.get(code),
  getIntangibleHeritage: (code: string): IntangibleHeritageEntry | undefined =>
    intangibleHeritageMap.get(code),
  getBiodiversity: (code: string): BiodiversityEntry | undefined =>
    biodiversityMap.get(code),
  getNomadVisaDetails: (code: string): NomadVisaDetails | undefined =>
    nomadVisaDetailsMap.get(code.toUpperCase()),
  hasNomadVisa: (code: string): boolean => nomadVisaSet.has(code.toUpperCase()),
  isSchengen: (code: string): boolean => schengenSet.has(code.toUpperCase()),
  getTouristVisaDays: (code: string): number | null => {
    const val = touristVisaDaysMap[code.toUpperCase()];
    return val === undefined ? null : val;
  },
  getAiMetrics: (code: string): AiMetricsEntry | undefined =>
    aiMetricsMap.get(code.toUpperCase()),
  getTourismAiMetrics: (code: string): TourismAiMetricsEntry | undefined =>
    tourismAiMetricsMap.get(code.toUpperCase()),
  getCostOfLiving: (code: string): CostOfLivingEntry | undefined =>
    costOfLivingMap.get(code.toUpperCase()),
};
