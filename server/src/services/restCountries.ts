import type { RestCountry } from '../utils/types';
import { cache } from '../middleware/cache';

const CACHE_KEY = 'restcountries:all';
const API_URL =
  'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,population,flags,capital,capitalInfo,latlng';

export async function fetchRestCountries(): Promise<RestCountry[]> {
  const cached = cache.get<RestCountry[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`REST Countries returned ${res.status}`);

  const data = (await res.json()) as RestCountry[];
  cache.set(CACHE_KEY, data);
  return data;
}
