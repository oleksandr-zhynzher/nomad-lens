import { describe, expect, it } from 'vitest';

import {
  average,
  climateScore,
  invertLogMinMax,
  invertMinMax,
  logMinMax,
  minMax,
} from '../normalize';

describe('minMax', () => {
  it('returns null for null value', () => {
    expect(minMax(null, 0, 100)).toBeNull();
  });

  it('returns null for NaN value', () => {
    expect(minMax(Number.NaN, 0, 100)).toBeNull();
  });

  it('returns null when max equals min', () => {
    expect(minMax(50, 50, 50)).toBeNull();
  });

  it('returns 0 for value at min', () => {
    expect(minMax(0, 0, 100)).toBe(0);
  });

  it('returns 100 for value at max', () => {
    expect(minMax(100, 0, 100)).toBe(100);
  });

  it('returns 50 for midpoint value', () => {
    expect(minMax(50, 0, 100)).toBe(50);
  });

  it('clamps value below min to 0', () => {
    expect(minMax(-10, 0, 100)).toBe(0);
  });

  it('clamps value above max to 100', () => {
    expect(minMax(150, 0, 100)).toBe(100);
  });

  it('works with non-zero min', () => {
    // (30 - 20) / (50 - 20) * 100 = 33.3...
    const result = minMax(30, 20, 50);
    expect(result).toBeCloseTo(33.3, 0);
  });
});

describe('logMinMax', () => {
  it('returns null for null value', () => {
    expect(logMinMax(null, 1, 100)).toBeNull();
  });

  it('returns null for non-positive value', () => {
    expect(logMinMax(0, 1, 100)).toBeNull();
    expect(logMinMax(-5, 1, 100)).toBeNull();
  });

  it('returns null for non-positive min', () => {
    expect(logMinMax(10, 0, 100)).toBeNull();
  });

  it('returns null for non-positive max', () => {
    expect(logMinMax(10, 1, 0)).toBeNull();
  });

  it('returns 0 when value equals min', () => {
    expect(logMinMax(1, 1, 100)).toBe(0);
  });

  it('returns 100 when value equals max', () => {
    expect(logMinMax(100, 1, 100)).toBe(100);
  });

  it('returns a value between 0 and 100 for in-range values', () => {
    const result = logMinMax(10, 1, 100);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
    expect(result!).toBeLessThan(100);
  });
});

describe('invertMinMax', () => {
  it('returns null when base is null', () => {
    expect(invertMinMax(null, 0, 100)).toBeNull();
  });

  it('returns 100 when value is at min (inverted)', () => {
    expect(invertMinMax(0, 0, 100)).toBe(100);
  });

  it('returns 0 when value is at max (inverted)', () => {
    expect(invertMinMax(100, 0, 100)).toBe(0);
  });

  it('returns 50 for midpoint value (inverted)', () => {
    expect(invertMinMax(50, 0, 100)).toBe(50);
  });

  it('result equals 100 minus minMax result', () => {
    const base = minMax(30, 0, 100)!;
    const inverted = invertMinMax(30, 0, 100)!;
    expect(inverted).toBeCloseTo(100 - base, 5);
  });
});

describe('invertLogMinMax', () => {
  it('returns null when log base is null', () => {
    expect(invertLogMinMax(null, 1, 100)).toBeNull();
    expect(invertLogMinMax(0, 1, 100)).toBeNull();
  });

  it('returns 0 when value equals max', () => {
    expect(invertLogMinMax(100, 1, 100)).toBe(0);
  });

  it('returns 100 when value equals min', () => {
    expect(invertLogMinMax(1, 1, 100)).toBe(100);
  });

  it('result equals 100 minus logMinMax result', () => {
    const base = logMinMax(10, 1, 100)!;
    const inverted = invertLogMinMax(10, 1, 100)!;
    expect(inverted).toBeCloseTo(100 - base, 5);
  });
});

describe('average', () => {
  it('returns null for empty array', () => {
    expect(average([])).toBeNull();
  });

  it('returns null when all values are null', () => {
    expect(average([null, null, null])).toBeNull();
  });

  it('filters out nulls and averages the rest', () => {
    expect(average([null, 40, null, 60])).toBe(50);
  });

  it('returns the single non-null value unchanged', () => {
    expect(average([null, 75, null])).toBe(75);
  });

  it('averages all values when no nulls', () => {
    expect(average([10, 20, 30])).toBe(20);
  });

  it('rounds to one decimal place', () => {
    // (10 + 20 + 21) / 3 = 17.0
    expect(average([10, 20, 21])).toBe(17);
  });
});

describe('climateScore', () => {
  it('returns a score between 0 and 100', () => {
    const score = climateScore(18, 650);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns high score for ideal temperature (18°C) and precipitation (650mm)', () => {
    const score = climateScore(18, 650);
    expect(score).toBeGreaterThan(90);
  });

  it('penalizes temperature far from 18°C', () => {
    const idealScore = climateScore(18, 650);
    const coldScore = climateScore(-5, 650);
    expect(coldScore).toBeLessThan(idealScore);
  });

  it('penalizes extreme temperature heat', () => {
    const idealScore = climateScore(18, 650);
    const hotScore = climateScore(40, 650);
    expect(hotScore).toBeLessThan(idealScore);
  });

  it('gives 100 precipitation score in range 400-900mm', () => {
    // Temperature ideal, precipitation ideal → max score
    const score600 = climateScore(18, 600);
    const score400 = climateScore(18, 400);
    const score900 = climateScore(18, 900);
    expect(score600).toBe(score400);
    expect(score600).toBe(score900);
  });

  it('penalizes very low precipitation (desert)', () => {
    const idealScore = climateScore(18, 650);
    const dryScore = climateScore(18, 50);
    expect(dryScore).toBeLessThan(idealScore);
  });

  it('penalizes very high precipitation (rainforest)', () => {
    const idealScore = climateScore(18, 650);
    const wetScore = climateScore(18, 3000);
    expect(wetScore).toBeLessThan(idealScore);
  });
});
