import { cache } from '../middleware/cache';
import type { OpenMeteoClimate } from '../utils/types';

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

  const res = await fetch(url);
  if (!res.ok) return null;

  const json = (await res.json()) as ArchiveResponse;
  const daily = json.daily;
  if (!daily) return null;

  const annualMeanTemp = meanOf(daily.temperature_2m_mean ?? []);
  const precipValues = (daily.precipitation_sum ?? []).filter(
    (v): v is number => v !== null && !isNaN(v),
  );
  const annualPrecipitation =
    precipValues.length > 0 ? precipValues.reduce((a, b) => a + b, 0) : null;

  if (annualMeanTemp === null || annualPrecipitation === null) return null;

  const result: OpenMeteoClimate = { annualMeanTemp, annualPrecipitation };
  cache.set(key, result);
  return result;
}
