import type { CountryData } from "@core/models";

export type SortField =
  | "country"
  | "overallScore"
  | "monthlyBudget"
  | "duration"
  | "cost"
  | "income"
  | "tax";

export type SortDirection = "asc" | "desc";

export interface VisaRow {
  readonly country: CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> };
  readonly overallScore: number;
  readonly monthlyBudget: number | null;
}
