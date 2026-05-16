import type { VisaField } from "@core/constants";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import type { BudgetMatch } from "@features/budget/hooks";

export type VisaCountry = CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> };

export interface SelectedSlot {
  readonly country: VisaCountry;
  readonly color: string;
  readonly index: number;
}

export interface VisaCellProps {
  readonly slot: SelectedSlot;
  readonly field: VisaField;
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly budgetMatchByCode: Map<string, BudgetMatch>;
  readonly lang: string;
}

export interface VisaSlotLangProps {
  readonly slot: SelectedSlot;
  readonly lang: string;
}
