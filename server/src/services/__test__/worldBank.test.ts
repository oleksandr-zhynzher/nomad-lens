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
import { WB_INDICATORS, fetchWorldBankIndicators } from '../worldBank';

function makeWbResponse(
  code: string,
  rows: Array<{ countryiso3code: string; date: string; value: number | null }>,
): Response {
  return {
    json: vi.fn().mockResolvedValue([{}, rows]),
    ok: true,
  } as unknown as Response;
}

describe('fetchWorldBankIndicators', () => {
  beforeEach(() => {
    vi.mocked(cache.get).mockReturnValue(undefined);
    vi.mocked(cache.set).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached map without fetching', async () => {
    const mockMap = { USA: { 'NY.GDP.PCAP.CD': { value: 65000, year: 2022 } } };
    vi.mocked(cache.get).mockReturnValue(mockMap);

    const result = await fetchWorldBankIndicators();
    expect(result).toBe(mockMap);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('calls fetchWithTimeout for each WB_INDICATORS entry', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue(makeWbResponse('gdpPerCapita', []));
    const indicatorCount = Object.keys(WB_INDICATORS).length;

    await fetchWorldBankIndicators();
    expect(fetchWithTimeout).toHaveBeenCalledTimes(indicatorCount);
  });

  it('builds a map keyed by uppercased ISO3 code', async () => {
    vi.mocked(fetchWithTimeout).mockImplementation((url: string) => {
      const code = 'NY.GDP.PCAP.CD';
      if (url.includes(code)) {
        return Promise.resolve(
          makeWbResponse(code, [{ countryiso3code: 'usa', date: '2022', value: 65000 }]),
        );
      }
      return Promise.resolve(makeWbResponse('other', []));
    });

    const result = await fetchWorldBankIndicators();
    expect('USA' in result).toBe(true);
  });

  it('keeps only the first (most-recent) value per country+indicator', async () => {
    const code = 'NY.GDP.PCAP.CD';
    const rows = [
      { countryiso3code: 'DEU', date: '2022', value: 48000 },
      { countryiso3code: 'DEU', date: '2021', value: 45000 }, // older, should be ignored
    ];
    vi.mocked(fetchWithTimeout).mockImplementation((url: string) => {
      if (url.includes(code)) {
        return Promise.resolve(makeWbResponse(code, rows));
      }
      return Promise.resolve(makeWbResponse('other', []));
    });

    const result = await fetchWorldBankIndicators();
    expect(result['DEU']?.[code]?.value).toBe(48000);
    expect(result['DEU']?.[code]?.year).toBe(2022);
  });

  it('skips rows with null values', async () => {
    const code = 'NY.GDP.PCAP.CD';
    vi.mocked(fetchWithTimeout).mockImplementation((url: string) => {
      if (url.includes(code)) {
        return Promise.resolve(
          makeWbResponse(code, [{ countryiso3code: 'XXX', date: '2022', value: null }]),
        );
      }
      return Promise.resolve(makeWbResponse('other', []));
    });

    const result = await fetchWorldBankIndicators();
    expect('XXX' in result).toBe(false);
  });

  it('continues gracefully when one indicator fetch fails (rejected)', async () => {
    vi.mocked(fetchWithTimeout).mockImplementation((url: string) => {
      if (url.includes('NY.GDP.PCAP.CD')) {
        return Promise.reject(new Error('network error'));
      }
      return Promise.resolve(makeWbResponse('other', []));
    });

    // Should not throw
    await expect(fetchWorldBankIndicators()).resolves.toBeDefined();
  });

  it('stores the result in cache', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue(makeWbResponse('any', []));

    await fetchWorldBankIndicators();
    expect(cache.set).toHaveBeenCalledWith('worldbank:indicators', expect.any(Object));
  });
});
