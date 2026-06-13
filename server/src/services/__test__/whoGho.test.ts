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
import { fetchWhoLifeExpectancy } from '../whoGho';

const SAMPLE_ROWS = [
  { NumericValue: 82.5, SpatialDim: 'JPN', TimeDim: 2022 },
  { NumericValue: 81.0, SpatialDim: 'JPN', TimeDim: 2021 }, // older — should be ignored
  { NumericValue: 78.2, SpatialDim: 'USA', TimeDim: 2022 },
  { NumericValue: null, SpatialDim: 'XYZ', TimeDim: 2022 }, // null value — should be skipped
];

describe('fetchWhoLifeExpectancy', () => {
  beforeEach(() => {
    vi.mocked(cache.get).mockReturnValue(undefined);
    vi.mocked(cache.set).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached Map without fetching', async () => {
    const mockMap = new Map([['JPN', 82.5]]);
    vi.mocked(cache.get).mockReturnValue(mockMap);

    const result = await fetchWhoLifeExpectancy();
    expect(result).toBe(mockMap);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('returns a Map on successful fetch', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue({ value: SAMPLE_ROWS }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchWhoLifeExpectancy();
    expect(result).toBeInstanceOf(Map);
  });

  it('keeps only the first (most-recent) value per country', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue({ value: SAMPLE_ROWS }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchWhoLifeExpectancy();
    expect(result.get('JPN')).toBe(82.5);
    expect(result.has('JPN')).toBe(true);
  });

  it('uses uppercased ISO3 codes as keys', async () => {
    const mockRes = {
      json: vi
        .fn()
        .mockResolvedValue({ value: [{ NumericValue: 75, SpatialDim: 'deu', TimeDim: 2022 }] }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchWhoLifeExpectancy();
    expect(result.has('DEU')).toBe(true);
  });

  it('skips rows with null NumericValue', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue({ value: SAMPLE_ROWS }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchWhoLifeExpectancy();
    expect(result.has('XYZ')).toBe(false);
  });

  it('stores result in cache', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue({ value: SAMPLE_ROWS }),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    await fetchWhoLifeExpectancy();
    expect(cache.set).toHaveBeenCalledWith('who:lifeExpectancy', expect.any(Map));
  });

  it('throws when API returns non-ok response', async () => {
    const mockRes = { ok: false, status: 503 } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    await expect(fetchWhoLifeExpectancy()).rejects.toThrow('WHO GHO returned 503');
  });
});
