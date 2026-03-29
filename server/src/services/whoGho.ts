import { cache } from '../middleware/cache';
import type { WhoIndicatorValue } from '../utils/types';

const CACHE_KEY = 'who:lifeExpectancy';
/** WHOSIS_000001 = Life expectancy at birth (both sexes) */
const API_URL =
  "https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=Dim1 eq 'BTSX'&$select=SpatialDim,TimeDim,NumericValue&$orderby=TimeDim desc&$top=600";

/** Map of ISO3 country code → most recent life expectancy value. */
export async function fetchWhoLifeExpectancy(): Promise<Map<string, number>> {
  const cached = cache.get<Map<string, number>>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`WHO GHO returned ${res.status}`);

  const json = (await res.json()) as { value: WhoIndicatorValue[] };
  const rows = json.value ?? [];

  // Keep most recent value per country (rows are already ordered DESC)
  const byCountry = new Map<string, number>();
  for (const row of rows) {
    const iso3 = row.SpatialDim?.toUpperCase();
    if (!iso3 || row.NumericValue === null) continue;
    if (!byCountry.has(iso3)) {
      byCountry.set(iso3, row.NumericValue);
    }
  }

  cache.set(CACHE_KEY, byCountry);
  return byCountry;
}
