import type { CountryData, WeightMap } from "@core/models";
import { VISIBLE_CATEGORY_KEYS } from "@core/models";
import type { RegionStats } from "@features/compare/constants";
import { REGION_COLORS } from "@features/compare/constants";

/** Compute per-category average scores for a set of countries in a region. */
function computeRegionCategories(regionCountries: CountryData[]): RegionStats["categories"] {
  const categories = {} as RegionStats["categories"];
  for (const key of VISIBLE_CATEGORY_KEYS) {
    const values = regionCountries
      .map((c) => c.scores[key].value)
      .filter((v): v is number => v != null);
    if (values.length === 0) {
      categories[key] = { avg: null, count: 0 };
    } else {
      const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      categories[key] = { avg, count: values.length };
    }
  }
  return categories;
}

/** Compute the weighted overall score for a region given its per-category averages. */
function computeRegionOverall(categories: RegionStats["categories"], weights: WeightMap): number {
  let numerator = 0;
  let denominator = 0;
  for (const key of VISIBLE_CATEGORY_KEYS) {
    const w = weights[key];
    if (w <= 0) continue;
    const avg = categories[key].avg;
    if (avg === null) continue;
    numerator += w * avg;
    denominator += w;
  }
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 10) / 10;
}

/** Compute per-region statistics for every visible category key and weighted overall. */
export function computeRegionStats(
  countries: CountryData[],
  allRegions: string[],
  weights: WeightMap,
): RegionStats[] {
  const grouped: Partial<Record<string, CountryData[]>> = {};
  for (const c of countries) {
    const existing = grouped[c.region];
    if (existing !== undefined) {
      existing.push(c);
    } else {
      grouped[c.region] = [c];
    }
  }

  return allRegions.map((regionName) => {
    const regionCountries = grouped[regionName] ?? [];
    const categories = computeRegionCategories(regionCountries);
    const overall = computeRegionOverall(categories, weights);
    return {
      name: regionName,
      count: regionCountries.length,
      color: REGION_COLORS[regionName] ?? "#888888",
      overall,
      categories,
    };
  });
}
