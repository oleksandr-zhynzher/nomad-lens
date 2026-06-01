import { describe, expect, it } from 'vitest';

import { getCountriesData, getCountriesDataStatus } from '../src/services/countriesData';

describe('countries data contract', () => {
  it('loads generated countries with complete category score contracts', () => {
    const countries = getCountriesData();

    expect(countries.length).toBeGreaterThan(0);
    expect(getCountriesDataStatus()).toEqual({
      count: countries.length,
      loaded: true,
    });
    expect(countries.every((country) => country.code.length === 2)).toBe(true);
    expect(countries.every((country) => Object.keys(country.scores).length >= 40)).toBe(true);
  });
});
