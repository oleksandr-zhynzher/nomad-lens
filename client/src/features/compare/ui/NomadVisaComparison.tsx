import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { BudgetMatch } from "@features/budget/hooks";
import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import { useSyncScroll, useComparisonSelection } from "@features/compare/hooks";
import type { SelectedSlot } from "@features/compare/utils";
import { NomadVisaComparisonSlots } from "./NomadVisaComparisonSlots";
import { NomadVisaComparisonGrid } from "./NomadVisaComparisonGrid";

interface NomadVisaComparisonProps {
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly budgetMatches: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
}

export function NomadVisaComparison({
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
}: NomadVisaComparisonProps) {
  const { i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;
  const budgetMatchByCode = new Map(budgetMatches.map((match) => [match.country.code, match]));
  const visaCountries = countries.filter((c) => c.nomadVisa != null);
  const {
    selectedSlots,
    handleAdd,
    handleRemove,
    filteredCandidates: filtered,
    dropdownOpen,
    setDropdownOpen,
    query,
    setQuery,
    headerRef,
    bodyRef,
  } = useComparisonSelection({
    allCandidates: visaCountries,
    selectedCodes,
    onSelectedCodesChange,
    lang,
  });
  useSyncScroll(headerRef, bodyRef);
  const selectedCountries = selectedSlots.filter(
    (s) => s.country.nomadVisa != null,
  ) as SelectedSlot[];
  return (
    <div>
      <NomadVisaComparisonSlots
        selectedCountries={selectedCountries}
        filteredCandidates={filtered}
        lang={lang}
        langPrefix={langPrefix}
        onRemove={handleRemove}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        query={query}
        setQuery={setQuery}
        onAdd={handleAdd}
      />
      {selectedCountries.length > 0 ? (
        <NomadVisaComparisonGrid
          selectedCountries={selectedCountries}
          weights={weights}
          climatePrefs={climatePrefs}
          budgetMatchByCode={budgetMatchByCode}
          lang={lang}
          headerRef={headerRef}
          bodyRef={bodyRef}
        />
      ) : null}
    </div>
  );
}
