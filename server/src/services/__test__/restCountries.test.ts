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
import { fetchRestCountries } from '../restCountries';

const SAMPLE_COUNTRIES = [
  {
    capital: ['Paris'],
    cca2: 'FR',
    cca3: 'FRA',
    flags: { png: 'https://example.com/fr.png', svg: 'https://example.com/fr.svg' },
    landlocked: false,
    latlng: [46.0, 2.0],
    name: { common: 'France', official: 'French Republic' },
    population: 67000000,
    region: 'Europe',
    subregion: 'Western Europe',
  },
];

describe('fetchRestCountries', () => {
  beforeEach(() => {
    vi.mocked(cache.get).mockReturnValue(undefined);
    vi.mocked(cache.set).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached value without fetching', async () => {
    vi.mocked(cache.get).mockReturnValue(SAMPLE_COUNTRIES);
    const result = await fetchRestCountries();
    expect(result).toBe(SAMPLE_COUNTRIES);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('fetches and returns data on cache miss', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue(SAMPLE_COUNTRIES),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    const result = await fetchRestCountries();
    expect(result).toEqual(SAMPLE_COUNTRIES);
  });

  it('stores fetched data in cache', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue(SAMPLE_COUNTRIES),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    await fetchRestCountries();
    expect(cache.set).toHaveBeenCalledWith('restcountries:all', SAMPLE_COUNTRIES);
  });

  it('throws when API returns non-ok response', async () => {
    const mockRes = { ok: false, status: 503 } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    await expect(fetchRestCountries()).rejects.toThrow('REST Countries returned 503');
  });

  it('calls the correct REST Countries endpoint', async () => {
    const mockRes = {
      json: vi.fn().mockResolvedValue([]),
      ok: true,
    } as unknown as Response;
    vi.mocked(fetchWithTimeout).mockResolvedValue(mockRes);

    await fetchRestCountries();
    const calledUrl = vi.mocked(fetchWithTimeout).mock.calls[0]?.[0];
    expect(calledUrl).toContain('restcountries.com');
    expect(calledUrl).toContain('cca2');
  });
});
