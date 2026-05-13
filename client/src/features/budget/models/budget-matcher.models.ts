import type { CountryData } from "@core/models";

export interface BudgetBreakdown {
  housing: number;
  groceries: number;
  dining: number;
  transport: number;
  utilities: number;
  coworking: number;
  healthInsurance: number;
}

export interface BudgetMatch {
  country: CountryData;
  comfortScore: number;
  monthlyCost: number;
  surplus: number;
  breakdown: BudgetBreakdown;
}
