import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../middleware/cache', () => ({
  cache: {
    get: vi.fn(),
    has: vi.fn(),
    invalidate: vi.fn(),
    set: vi.fn(),
    size: vi.fn().mockReturnValue(0),
  },
}));

vi.mock('../../shared/http', () => ({
  fetchWithTimeout: vi.fn(),
}));

import { cache } from '../../middleware/cache';
import { fetchWithTimeout } from '../../shared/http';
import { fetchClimate } from '../openMeteo';

function buildDailyData(): { temperature_2m_mean: number[]; precipitation_sum: number[] } {
  // Build 365 day arrays for 2023
  const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const tempsByMonth = [5, 6, 10, 15, 20, 25, 28, 27, 22, 16, 10, 6];
  const temperature_2m_mean: number[] = [];
  const precipitation_sum: number[] = [];
  for (let m = 0; m < 12; m++) {
    const days = DAYS_PER_MONTH[m] ?? 30;
    for (let d = 0; d < days; d++) {
      temperature_2m_mean.push(tempsByMonth[m] ?? 15);
      precipitation_sum.push(2);
    }
  }
  return { temperature_2m_mean, precipitation_sum };
}

describe('fetchClimate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(cache.get).mockReturnValue(undefined);
    vi.mocked(cache.set).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns cached value immediately without fetching', async () => {
    const mockClimate = {
      annualMeanTemp: 15,
      annualPrecipitation: 730,
      coldestMonth: 5,
      hottestMonth: 28,
      seasonType: 'four_seasons' as const,
      tempRange: 23,
    };
    vi.mocked(cache.get).mockReturnValue(mockClimate);
    const result = await fetchClimate(48.85, 2.35);
    expect(result).toBe(mockClimate);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('fetches and returns climate data on cache miss', async () => {
    const daily = buildDailyData();
    const mockRes = {
      json: vi.fn().mockResolvedValue({ daily }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const resultPromise = fetchClimate(48.85, 2.35);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).not.toBeNull();
    expect(typeof result?.annualMeanTemp).toBe('number');
    expect(typeof result?.annualPrecipitation).toBe('number');
    expect(typeof result?.seasonType).toBe('string');
  });

  it('stores the fetched result in cache', async () => {
    const daily = buildDailyData();
    const mockRes = {
      json: vi.fn().mockResolvedValue({ daily }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const resultPromise = fetchClimate(48.85, 2.35);
    await vi.runAllTimersAsync();
    await resultPromise;

    expect(cache.set).toHaveBeenCalledWith(
      expect.stringContaining('openmeteo:climate:'),
      expect.objectContaining({ annualMeanTemp: expect.any(Number) }),
    );
  });

  it('returns null for non-retryable non-ok status (e.g. 400)', async () => {
    const mockRes = { ok: false, status: 400 } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchClimate(0, 0);
    expect(result).toBeNull();
  });

  it('retries on 429 and eventually returns null after 3 attempts', async () => {
    const mockRes = { ok: false, status: 429 } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const resultPromise = fetchClimate(0, 0);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(fetchWithTimeout).toHaveBeenCalledTimes(3);
    expect(result).toBeNull();
  });

  it('retries on 500 status', async () => {
    const mockRes = { ok: false, status: 500 } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const resultPromise = fetchClimate(1, 1);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(fetchWithTimeout).toHaveBeenCalledTimes(3);
    expect(result).toBeNull();
  });

  it('returns null when response has no daily object', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue({}),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchClimate(10, 10);
    expect(result).toBeNull();
  });
});
