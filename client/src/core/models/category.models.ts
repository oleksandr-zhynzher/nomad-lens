import type { IndicatorValue } from "./indicator.models";

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
} from "../constants/category.constants";

export interface CategoryScore {
  /** Normalized 0–100 composite score for this category. null = data unavailable. */
  value: number | null;
  indicators: Record<string, IndicatorValue | undefined>;
}

export type CategoryKey =
  | "economy"
  | "affordability"
  | "foodSecurity"
  | "healthcare"
  | "education"
  | "environment"
  | "climate"
  | "safety"
  | "infrastructure"
  | "happiness"
  | "humanDevelopment"
  | "governance"
  | "englishProficiency"
  | "digitalFreedom"
  | "personalFreedom"
  | "logistics"
  | "biodiversity"
  | "socialTolerance"
  | "taxFriendliness"
  | "startupEnvironment"
  | "airConnectivity"
  | "culturalHeritage"
  | "healthcareCost"
  | "tourismSafety"
  | "accommodationCost"
  | "transportCost"
  | "tourismInfrastructure"
  | "localFriendliness"
  | "nightlifeEntertainment"
  | "touristScamSafety"
  | "streetFoodCuisine"
  | "beachWaterQuality"
  | "walkabilityScenicBeauty"
  | "shoppingMarkets"
  | "photographySpots"
  | "familyFriendliness"
  | "adventureSports"
  | "historicalSites"
  | "nomadCommunity"
  | "visaFriendliness"
  | "costEfficiency"
  | "workLifeBalance"
  | "digitalReadiness"
  | "culturalFit";
