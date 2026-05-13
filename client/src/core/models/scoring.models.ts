import type { CategoryKey } from "./category.models";
import type { CountryData } from "./country.models";

export type WeightMode = "independent" | "balanced";

export type WeightMap = Record<CategoryKey, number>;

export interface RankedCountry {
  country: CountryData;
  finalScore: number;
  rank: number;
}
