import { describe, expect, it } from 'vitest';
import { average, invertLogMinMax, invertMinMax, logMinMax, minMax } from '../src/utils/normalize';

describe('normalization utilities', () => {
  it('normalizes values into the 0-100 range', () => {
    expect(minMax(50, 0, 100)).toBe(50);
    expect(minMax(-10, 0, 100)).toBe(0);
    expect(minMax(120, 0, 100)).toBe(100);
  });

  it('returns null for invalid normalization inputs', () => {
    expect(minMax(null, 0, 100)).toBeNull();
    expect(minMax(Number.NaN, 0, 100)).toBeNull();
    expect(minMax(10, 5, 5)).toBeNull();
    expect(logMinMax(-1, 1, 100)).toBeNull();
  });

  it('inverts linear and logarithmic scores', () => {
    expect(invertMinMax(25, 0, 100)).toBe(75);
    expect(invertLogMinMax(10, 1, 100)).toBe(50);
  });

  it('averages only available scores', () => {
    expect(average([100, null, 50])).toBe(75);
    expect(average([null, null])).toBeNull();
  });
});
