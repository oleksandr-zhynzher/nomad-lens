import hdiJson from '../data/hdi.json';
import happinessJson from '../data/happiness.json';
import peaceJson from '../data/peace.json';
import crimeJson from '../data/crime.json';
import cpiJson from '../data/cpi.json';
import type { HdiEntry, HappinessEntry, PeaceEntry, CrimeEntry, CpiEntry } from '../utils/types';

type JsonFile<T> = { data: T[] };

const hdiMap = new Map<string, HdiEntry>();
const happinessMap = new Map<string, HappinessEntry>();
const peaceMap = new Map<string, PeaceEntry>();
const crimeMap = new Map<string, CrimeEntry>();
const cpiMap = new Map<string, CpiEntry>();

(hdiJson as unknown as JsonFile<HdiEntry>).data.forEach((e) => hdiMap.set(e.code, e));
(happinessJson as unknown as JsonFile<HappinessEntry>).data.forEach((e) => happinessMap.set(e.code, e));
(peaceJson as unknown as JsonFile<PeaceEntry>).data.forEach((e) => peaceMap.set(e.code, e));
(crimeJson as unknown as JsonFile<CrimeEntry>).data.forEach((e) => crimeMap.set(e.code, e));
(cpiJson as unknown as JsonFile<CpiEntry>).data.forEach((e) => cpiMap.set(e.code, e));

export const localData = {
  getHdi: (code: string): HdiEntry | undefined => hdiMap.get(code),
  getHappiness: (code: string): HappinessEntry | undefined => happinessMap.get(code),
  getPeace: (code: string): PeaceEntry | undefined => peaceMap.get(code),
  getCrime: (code: string): CrimeEntry | undefined => crimeMap.get(code),
  getCpi: (code: string): CpiEntry | undefined => cpiMap.get(code),
};
