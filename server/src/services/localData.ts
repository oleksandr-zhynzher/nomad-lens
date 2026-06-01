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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readDataFile<T extends { code: string }>(file: unknown, name: string): T[] {
  if (!isRecord(file) || !Array.isArray(file['data'])) {
    throw new Error(`${name} must contain a data array`);
  }

  for (const [index, entry] of file['data'].entries()) {
    if (!isRecord(entry) || typeof entry['code'] !== 'string' || entry['code'].length === 0) {
      throw new Error(`${name} entry at index ${index} must contain a country code`);
    }
  }

  return file['data'] as T[];
}

function readCodeArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    throw new Error(`${name} must be an array of country codes`);
  }
  return value;
}

function readTouristVisaDays(value: unknown): Record<string, number | null> {
  if (
    !isRecord(value) ||
    !Object.values(value).every((entry) => entry === null || typeof entry === 'number')
  ) {
    throw new Error('touristVisaDays must be a number/null record');
  }

  return value as Record<string, number | null>;
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

const nomadVisaSet = new Set<string>(
  readCodeArray(nomadVisaJson.countries, 'nomad visa countries'),
);
const nomadVisaDetailsMap = new Map<string, NomadVisaDetails>();
for (const e of readDataFile<NomadVisaDetails>(
  { data: nomadVisaDetailsJson },
  'nomad visa details',
))
  nomadVisaDetailsMap.set(e.code.toUpperCase(), e);
const schengenSet = new Set<string>(readCodeArray(visasJson.schengen, 'schengen countries'));
const touristVisaDaysMap = readTouristVisaDays(visasJson.touristVisaDays);

for (const e of readDataFile<HdiEntry>(hdiJson, 'hdi')) hdiMap.set(e.code, e);
for (const e of readDataFile<HappinessEntry>(happinessJson, 'happiness'))
  happinessMap.set(e.code, e);
for (const e of readDataFile<PeaceEntry>(peaceJson, 'peace')) peaceMap.set(e.code, e);
for (const e of readDataFile<CrimeEntry>(crimeJson, 'crime')) crimeMap.set(e.code, e);
for (const e of readDataFile<CpiEntry>(cpiJson, 'cpi')) cpiMap.set(e.code, e);
for (const e of readDataFile<EpiEntry>(epiJson, 'epi')) epiMap.set(e.code, e);
for (const e of readDataFile<DigitalFreedomEntry>(digitalFreedomJson, 'digital freedom'))
  digitalFreedomMap.set(e.code, e);
for (const e of readDataFile<PersonalFreedomEntry>(personalFreedomJson, 'personal freedom'))
  personalFreedomMap.set(e.code, e);
for (const e of readDataFile<SocialToleranceEntry>(socialToleranceJson, 'social tolerance'))
  socialToleranceMap.set(e.code, e);
for (const e of readDataFile<TaxBurdenEntry>(taxBurdenJson, 'tax burden'))
  taxBurdenMap.set(e.code, e);
for (const e of readDataFile<StartupEntry>(startupEnvironmentJson, 'startup environment'))
  startupMap.set(e.code, e);
for (const e of readDataFile<AirportEntry>(airportsJson, 'airports')) airportMap.set(e.code, e);
for (const e of readDataFile<HeritageEntry>(culturalHeritageJson, 'cultural heritage'))
  heritageMap.set(e.code, e);
for (const e of readDataFile<IntangibleHeritageEntry>(
  intangibleHeritageJson,
  'intangible heritage',
))
  intangibleHeritageMap.set(e.code, e);
for (const e of readDataFile<BiodiversityEntry>(biodiversityJson, 'biodiversity'))
  biodiversityMap.set(e.code, e);
for (const e of readDataFile<AiMetricsEntry>(aiMetricsJson, 'ai metrics'))
  aiMetricsMap.set(e.code.toUpperCase(), e);
for (const e of readDataFile<TourismAiMetricsEntry>(tourismAiMetricsJson, 'tourism ai metrics'))
  tourismAiMetricsMap.set(e.code.toUpperCase(), e);
for (const e of readDataFile<CostOfLivingEntry>(costOfLivingJson, 'cost of living'))
  costOfLivingMap.set(e.code.toUpperCase(), e);

const toCountryCodeKey = (code: string): string => code.toUpperCase();

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
    nomadVisaDetailsMap.get(toCountryCodeKey(code)),
  hasNomadVisa: (code: string): boolean => nomadVisaSet.has(toCountryCodeKey(code)),
  isSchengen: (code: string): boolean => schengenSet.has(toCountryCodeKey(code)),
  getTouristVisaDays: (code: string): number | null => {
    const val = touristVisaDaysMap[toCountryCodeKey(code)];
    return val === undefined ? null : val;
  },
  getAiMetrics: (code: string): AiMetricsEntry | undefined =>
    aiMetricsMap.get(toCountryCodeKey(code)),
  getTourismAiMetrics: (code: string): TourismAiMetricsEntry | undefined =>
    tourismAiMetricsMap.get(toCountryCodeKey(code)),
  getCostOfLiving: (code: string): CostOfLivingEntry | undefined =>
    costOfLivingMap.get(toCountryCodeKey(code)),
};
