/**
 * Normalize a value to the 0–100 scale using min-max normalization.
 * Returns null if value is null/NaN or if max === min.
 */
export function minMax(
  value: number | null,
  min: number,
  max: number,
): number | null {
  if (value === null || isNaN(value)) return null;
  if (max === min) return null;
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(((clamped - min) / (max - min)) * 1000) / 10;
}

/**
 * Log-scale min-max normalization — good for GDP where distribution is skewed.
 */
export function logMinMax(
  value: number | null,
  min: number,
  max: number,
): number | null {
  if (value === null || isNaN(value) || value <= 0 || min <= 0 || max <= 0)
    return null;
  return minMax(Math.log(value), Math.log(min), Math.log(max));
}

/**
 * Inverted min-max — use when lower value means better (e.g. pollution, crime).
 */
export function invertMinMax(
  value: number | null,
  min: number,
  max: number,
): number | null {
  const raw = minMax(value, min, max);
  if (raw === null) return null;
  return Math.round((100 - raw) * 10) / 10;
}

/**
 * Inverted log-scale min-max — use when lower value means better on a skewed
 * distribution (e.g. nominal GDP as a cost-of-living proxy).
 */
export function invertLogMinMax(
  value: number | null,
  min: number,
  max: number,
): number | null {
  const raw = logMinMax(value, min, max);
  if (raw === null) return null;
  return Math.round((100 - raw) * 10) / 10;
}

/**
 * Average an array of 0–100 scores, ignoring nulls.
 * Returns null if all values are null.
 */
export function average(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}

/**
 * Climate comfort score.
 * Scores temperature deviation from 18°C and precipitation suitability.
 * Returns 0–100 (higher = more comfortable).
 */
export function climateScore(
  annualMeanTemp: number,
  annualPrecipitation: number,
): number {
  // Ideal temperature range: 14–22°C → max score
  const tempDev = Math.abs(annualMeanTemp - 18);
  const tempScore = Math.max(0, 100 - tempDev * 5);

  // Ideal precipitation: 400–900 mm/year
  let precipScore: number;
  if (annualPrecipitation >= 400 && annualPrecipitation <= 900) {
    precipScore = 100;
  } else if (annualPrecipitation < 400) {
    precipScore = Math.max(0, (annualPrecipitation / 400) * 100);
  } else {
    precipScore = Math.max(0, 100 - ((annualPrecipitation - 900) / 1100) * 100);
  }

  return Math.round((tempScore * 0.6 + precipScore * 0.4) * 10) / 10;
}
