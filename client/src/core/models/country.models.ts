// Barrel – import from this file or directly from the sub-model files.

// ─── Country ──────────────────────────────────────────────────────────────────

import type { CategoryKey, CategoryScore } from "./category.models";
import type { ClimateData } from "./climate.models";
import type { CostOfLivingData } from "./cost-of-living.models";
import type { NomadVisaDetails } from "./visa.models";

export type { ApiHealthResponse } from "./api.models";
export type { CategoryKey, CategoryScore } from "./category.models";
export {
  AI_CATEGORIES,
  AI_CATEGORY_KEYS,
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  DISPLAYED_CORE_CATEGORY_KEYS,
  TOURISM_CATEGORY_KEYS,
  TOURISM_GROUPS,
  VISIBLE_CATEGORY_KEYS,
} from "./category.models";
export type { ClimateData, ClimatePreferences, SeasonType } from "./climate.models";
export type { CostOfLivingData } from "./cost-of-living.models";
export type { IndicatorValue } from "./indicator.models";
export type { RankedCountry, WeightMap, WeightMode } from "./scoring.models";
export type {
  NomadVisaApplicationProcess,
  NomadVisaCost,
  NomadVisaDetails,
  NomadVisaDuration,
  NomadVisaEligibility,
  NomadVisaIncomeRequirement,
  NomadVisaLocalization,
  NomadVisaTax,
} from "./visa.models";

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  population: number;
  flagUrl: string;
  capital: string;
  hasNomadVisa?: boolean;
  isSchengen?: boolean;
  touristVisaDays?: number | null;
  landlocked?: boolean;
  tourismTags?: string[];
  tourismTagScores?: Record<string, number>;
  tourismTagSeasonality?: Record<string, number[]>;
  nomadVisa?: NomadVisaDetails;
  climateData?: ClimateData;
  costOfLiving?: CostOfLivingData | null;
  scores: Record<CategoryKey, CategoryScore>;
  i18n?: {
    ru?: { name?: string; capital?: string };
    ua?: { name?: string; capital?: string };
  };
}
