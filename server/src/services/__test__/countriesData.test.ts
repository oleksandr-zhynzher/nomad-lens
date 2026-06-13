import { describe, expect, it } from 'vitest';

import { getCountriesData, getCountriesDataStatus } from '../countriesData';

describe('getCountriesData', () => {
  it('returns a non-empty array', () => {
    const data = getCountriesData();
    expect(data.length).toBeGreaterThan(0);
  });

  it('each country has a 2-character ISO code', () => {
    const data = getCountriesData();
    expect(data.every((c) => typeof c.code === 'string' && c.code.length === 2)).toBe(true);
  });

  it('each country has a non-empty name', () => {
    const data = getCountriesData();
    expect(data.every((c) => typeof c.name === 'string' && c.name.length > 0)).toBe(true);
  });

  it('each country has a non-empty region', () => {
    const data = getCountriesData();
    expect(data.every((c) => typeof c.region === 'string' && c.region.length > 0)).toBe(true);
  });

  it('each country has a population number', () => {
    const data = getCountriesData();
    expect(
      data.every((c) => typeof c.population === 'number' && Number.isFinite(c.population)),
    ).toBe(true);
  });

  it('each country has a flagUrl', () => {
    const data = getCountriesData();
    expect(data.every((c) => typeof c.flagUrl === 'string' && c.flagUrl.length > 0)).toBe(true);
  });

  it('each country has a scores object with at least 40 categories', () => {
    const data = getCountriesData();
    expect(data.every((c) => Object.keys(c.scores).length >= 40)).toBe(true);
  });

  it('returns the same reference on subsequent calls (no re-parsing)', () => {
    const first = getCountriesData();
    const second = getCountriesData();
    expect(first).toBe(second);
  });
});

describe('getCountriesDataStatus', () => {
  it('returns loaded = true when data is present', () => {
    const status = getCountriesDataStatus();
    expect(status.loaded).toBe(true);
  });

  it('count matches the number of countries', () => {
    const data = getCountriesData();
    const status = getCountriesDataStatus();
    expect(status.count).toBe(data.length);
  });

  it('count is a positive integer', () => {
    const status = getCountriesDataStatus();
    expect(Number.isInteger(status.count)).toBe(true);
    expect(status.count).toBeGreaterThan(0);
  });
});
