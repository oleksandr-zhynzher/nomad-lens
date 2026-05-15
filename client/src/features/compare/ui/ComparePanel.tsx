import type React from "react";
import { BudgetComparison } from "./BudgetComparison";
import { CountryComparison } from "./CountryComparison";
import { NomadVisaComparison } from "./NomadVisaComparison";
import { RegionComparison } from "./RegionComparison";
import { TourismComparison } from "./TourismComparison";
import type { CompareMode } from "@features/compare/utils";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import type { BudgetMatch } from "@features/budget/hooks";
import type { SortDirection } from "@features/compare/utils";

export interface ComparePanelProps {
  readonly compareMode: CompareMode;
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly budgetMatches: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection: SortDirection;
  readonly onSelectionCount: (count: number) => void;
}

export function ComparePanel({
  compareMode,
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
  sortDirection,
  onSelectionCount,
}: ComparePanelProps): React.JSX.Element {
  switch (compareMode) {
    case "regions":
      return (
        <RegionComparison countries={countries} weights={weights} climatePrefs={climatePrefs} />
      );
    case "nomadVisas":
      return (
        <NomadVisaComparison
          countries={countries}
          weights={weights}
          climatePrefs={climatePrefs}
          budgetMatches={budgetMatches}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
        />
      );
    case "budget":
      return (
        <BudgetComparison
          countries={countries}
          matches={budgetMatches}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortDirection={sortDirection}
        />
      );
    case "tourism":
      return (
        <TourismComparison
          countries={countries}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortDirection={sortDirection}
          onSelectionCount={onSelectionCount}
        />
      );
    case "countries":
      return (
        <CountryComparison
          countries={countries}
          weights={weights}
          climatePrefs={climatePrefs}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortDirection={sortDirection}
          onSelectionCount={onSelectionCount}
        />
      );
  }
}
