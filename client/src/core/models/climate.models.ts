export type SeasonType = "four_seasons" | "mild_seasons" | "tropical" | "arid" | "polar";

export interface ClimateData {
  annualMeanTemp: number;
  annualPrecipitation: number;
  tempRange: number;
  hottestMonth: number; // °C – warmest monthly mean
  coldestMonth: number; // °C – coldest monthly mean
  seasonType: SeasonType;
}

export interface ClimatePreferences {
  seasonType: SeasonType | "any";
  minTemp: number;
  maxTemp: number;
}
