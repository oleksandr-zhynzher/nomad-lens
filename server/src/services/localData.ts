import aiMetricsJson from '../data/ai-metrics.json';
import airportsJson from '../data/airports.json';
import biodiversityJson from '../data/biodiversity.json';
import costOfLivingJson from '../data/costOfLiving.json';
import cpiJson from '../data/cpi.json';
import crimeJson from '../data/crime.json';
import culturalHeritageJson from '../data/culturalHeritage.json';
import digitalFreedomJson from '../data/digitalFreedom.json';
import epiJson from '../data/epi.json';
import happinessJson from '../data/happiness.json';
import hdiJson from '../data/hdi.json';
import intangibleHeritageJson from '../data/intangibleHeritage.json';
import nomadVisaJson from '../data/nomadVisa.json';
import nomadVisaDetailsJson from '../data/nomadVisaDetails.json';
import peaceJson from '../data/peace.json';
import personalFreedomJson from '../data/personalFreedom.json';
import socialToleranceJson from '../data/socialTolerance.json';
import startupEnvironmentJson from '../data/startupEnvironment.json';
import taxBurdenJson from '../data/taxBurden.json';
import tourismAiMetricsJson from '../data/tourism-ai-metrics.json';
import visasJson from '../data/visas.json';
import type {
  AiMetricsEntry,
  AirportEntry,
  BiodiversityEntry,
  CostOfLivingEntry,
  CpiEntry,
  CrimeEntry,
  DigitalFreedomEntry,
  EpiEntry,
  HappinessEntry,
  HdiEntry,
  HeritageEntry,
  IntangibleHeritageEntry,
  NomadVisaDetails,
  PeaceEntry,
  PersonalFreedomEntry,
  SocialToleranceEntry,
  StartupEntry,
  TaxBurdenEntry,
  TourismAiMetricsEntry,
} from '../utils/types';

interface JsonFile<T> {
  data: T[];
}

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
for (const e of nomadVisaDetailsJson as unknown as NomadVisaDetails[])
  nomadVisaDetailsMap.set(e.code.toUpperCase(), e);
const schengenSet = new Set<string>(visasJson.schengen);
const touristVisaDaysMap = visasJson.touristVisaDays as Record<string, number | null>;

for (const e of (hdiJson as unknown as JsonFile<HdiEntry>).data) hdiMap.set(e.code, e);
for (const e of (happinessJson as unknown as JsonFile<HappinessEntry>).data)
  happinessMap.set(e.code, e);
for (const e of (peaceJson as unknown as JsonFile<PeaceEntry>).data) peaceMap.set(e.code, e);
for (const e of (crimeJson as unknown as JsonFile<CrimeEntry>).data) crimeMap.set(e.code, e);
for (const e of (cpiJson as unknown as JsonFile<CpiEntry>).data) cpiMap.set(e.code, e);
for (const e of (epiJson as unknown as JsonFile<EpiEntry>).data) epiMap.set(e.code, e);
for (const e of (digitalFreedomJson as unknown as JsonFile<DigitalFreedomEntry>).data)
  digitalFreedomMap.set(e.code, e);
for (const e of (personalFreedomJson as unknown as JsonFile<PersonalFreedomEntry>).data)
  personalFreedomMap.set(e.code, e);
for (const e of (socialToleranceJson as unknown as JsonFile<SocialToleranceEntry>).data)
  socialToleranceMap.set(e.code, e);
for (const e of (taxBurdenJson as unknown as JsonFile<TaxBurdenEntry>).data)
  taxBurdenMap.set(e.code, e);
for (const e of (startupEnvironmentJson as unknown as JsonFile<StartupEntry>).data)
  startupMap.set(e.code, e);
for (const e of (airportsJson as unknown as JsonFile<AirportEntry>).data) airportMap.set(e.code, e);
for (const e of (culturalHeritageJson as unknown as JsonFile<HeritageEntry>).data)
  heritageMap.set(e.code, e);
for (const e of (intangibleHeritageJson as unknown as JsonFile<IntangibleHeritageEntry>).data)
  intangibleHeritageMap.set(e.code, e);
for (const e of (biodiversityJson as unknown as JsonFile<BiodiversityEntry>).data)
  biodiversityMap.set(e.code, e);
for (const e of (aiMetricsJson as unknown as JsonFile<AiMetricsEntry>).data)
  aiMetricsMap.set(e.code.toUpperCase(), e);
for (const e of (tourismAiMetricsJson as unknown as JsonFile<TourismAiMetricsEntry>).data)
  tourismAiMetricsMap.set(e.code.toUpperCase(), e);
for (const e of (costOfLivingJson as unknown as JsonFile<CostOfLivingEntry>).data)
  costOfLivingMap.set(e.code.toUpperCase(), e);

export const localData = {
  getHdi: (code: string): HdiEntry | undefined => hdiMap.get(code),
  getHappiness: (code: string): HappinessEntry | undefined => happinessMap.get(code),
  getPeace: (code: string): PeaceEntry | undefined => peaceMap.get(code),
  getCrime: (code: string): CrimeEntry | undefined => crimeMap.get(code),
  getCpi: (code: string): CpiEntry | undefined => cpiMap.get(code),
  getEpi: (code: string): EpiEntry | undefined => epiMap.get(code),
  getDigitalFreedom: (code: string): DigitalFreedomEntry | undefined => digitalFreedomMap.get(code),
  getPersonalFreedom: (code: string): PersonalFreedomEntry | undefined =>
    personalFreedomMap.get(code),
  getSocialTolerance: (code: string): SocialToleranceEntry | undefined =>
    socialToleranceMap.get(code),
  getTaxBurden: (code: string): TaxBurdenEntry | undefined => taxBurdenMap.get(code),
  getStartup: (code: string): StartupEntry | undefined => startupMap.get(code),
  getAirport: (code: string): AirportEntry | undefined => airportMap.get(code),
  getHeritage: (code: string): HeritageEntry | undefined => heritageMap.get(code),
  getIntangibleHeritage: (code: string): IntangibleHeritageEntry | undefined =>
    intangibleHeritageMap.get(code),
  getBiodiversity: (code: string): BiodiversityEntry | undefined => biodiversityMap.get(code),
  getNomadVisaDetails: (code: string): NomadVisaDetails | undefined =>
    nomadVisaDetailsMap.get(code.toUpperCase()),
  hasNomadVisa: (code: string): boolean => nomadVisaSet.has(code.toUpperCase()),
  isSchengen: (code: string): boolean => schengenSet.has(code.toUpperCase()),
  getTouristVisaDays: (code: string): number | null => {
    const val = touristVisaDaysMap[code.toUpperCase()];
    return val === undefined ? null : val;
  },
  getAiMetrics: (code: string): AiMetricsEntry | undefined => aiMetricsMap.get(code.toUpperCase()),
  getTourismAiMetrics: (code: string): TourismAiMetricsEntry | undefined =>
    tourismAiMetricsMap.get(code.toUpperCase()),
  getCostOfLiving: (code: string): CostOfLivingEntry | undefined =>
    costOfLivingMap.get(code.toUpperCase()),
};
