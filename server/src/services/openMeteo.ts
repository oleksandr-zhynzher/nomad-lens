import { cache } from '../middleware/cache';
import type { OpenMeteoClimate, SeasonType } from '../utils/types';

const CACHE_NS = 'openmeteo:climate:';

interface ArchiveResponse {
  daily?: {
    temperature_2m_mean?: (number | null)[];
    precipitation_sum?: (number | null)[];
  };
}

function meanOf(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 2023 non-leap

function monthlyMeansOf(values: (number | null)[]): number[] {
  const means: number[] = [];
  let dayIdx = 0;
  for (const daysInMonth of DAYS_PER_MONTH) {
    const slice = values.slice(dayIdx, dayIdx + daysInMonth);
    const valid = slice.filter((v): v is number => v !== null && !isNaN(v));
    means.push(valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : NaN);
    dayIdx += daysInMonth;
  }
  return means;
}

function classifySeasonType(
  annualMean: number,
  annualPrecip: number,
  tempRange: number,
): SeasonType {
  if (annualPrecip < 250) return 'arid';
  if (annualMean < 3) return 'polar';
  if (tempRange >= 20) return 'four_seasons';
  if (annualMean >= 18) return 'tropical';
  return 'mild_seasons';
}

/**
 * Fetch 1-year climate data for a coordinate from Open-Meteo archive.
 * Uses 2023 as the reference year. Results are cached for 24 h.
 */
export async function fetchClimate(
  lat: number,
  lng: number,
): Promise<OpenMeteoClimate | null> {
  const key = `${CACHE_NS}${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get<OpenMeteoClimate>(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    daily: 'temperature_2m_mean,precipitation_sum',
    timezone: 'GMT',
  });
  const url = `https://archive-api.open-meteo.com/v1/archive?${params}`;

  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url);
    if (res.ok) break;
    // Retry on rate-limit (429) or server errors (5xx)
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      res = null;
      continue;
    }
    return null; // Non-retryable error
  }
  if (!res || !res.ok) return null;

  const json = (await res.json()) as ArchiveResponse;
  const daily = json.daily;
  if (!daily) return null;

  const tempRaw = daily.temperature_2m_mean ?? [];
  const annualMeanTemp = meanOf(tempRaw);
  const monthlyMeans = monthlyMeansOf(tempRaw);
  const validMonthly = monthlyMeans.filter((v) => !isNaN(v));

  const precipValues = (daily.precipitation_sum ?? []).filter(
    (v): v is number => v !== null && !isNaN(v),
  );
  const annualPrecipitation =
    precipValues.length > 0 ? precipValues.reduce((a, b) => a + b, 0) : null;

  if (annualMeanTemp === null || annualPrecipitation === null || validMonthly.length < 12) return null;

  const maxMonthTemp = Math.max(...monthlyMeans);
  const minMonthTemp = Math.min(...monthlyMeans);
  const tempRange = maxMonthTemp - minMonthTemp;
  const hottestMonth = monthlyMeans.indexOf(maxMonthTemp);
  const coldestMonth = monthlyMeans.indexOf(minMonthTemp);
  const seasonType = classifySeasonType(annualMeanTemp, annualPrecipitation, tempRange);

  const result: OpenMeteoClimate = {
    annualMeanTemp,
    annualPrecipitation,
    tempRange,
    hottestMonth,
    coldestMonth,
    seasonType,
  };
  cache.set(key, result);
  return result;
}
