import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { CountryData, WeightMap, ClimatePreferences } from "@core/models";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { useSyncScroll, useComparisonSelection } from "@features/compare/hooks";
import { CountryComparisonSlots } from "./CountryComparisonSlots";
import { CountryComparisonGrid } from "./CountryComparisonGrid";

interface CountryComparisonProps {
  readonly countries: CountryData[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection?: "desc" | "asc" | null;
  readonly onSelectionCount?: (count: number) => void;
}

export function CountryComparison({
  countries,
  weights,
  climatePrefs,
  selectedCodes,
  onSelectedCodesChange,
  sortDirection = null,
  onSelectionCount,
}: CountryComparisonProps) {
  const { i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;

  const {
    selectedSlots: selectedCountries,
    handleAdd,
    handleRemove,
    filteredCandidates: filtered,
    dropdownOpen,
    setDropdownOpen,
    dropdownPos,
    setDropdownPos,
    query,
    setQuery,
    addBtnRef,
    headerRef,
    bodyRef,
  } = useComparisonSelection({
    allCandidates: countries,
    selectedCodes,
    onSelectedCodesChange,
    lang,
    onSelectionCount,
  });

  useSyncScroll(headerRef, bodyRef);

  const sortedCountries = useMemo(() => {
    if (sortDirection == null) return selectedCountries;
    return [...selectedCountries].sort((slotA, slotB) => {
      const scoreA = computeScore(applyClimate(slotA.country, climatePrefs), weights);
      const scoreB = computeScore(applyClimate(slotB.country, climatePrefs), weights);
      const scoreDelta = scoreB - scoreA;
      return sortDirection === "desc" ? scoreDelta : -scoreDelta;
    });
  }, [selectedCountries, sortDirection, climatePrefs, weights]);

  return (
    <div>
      <CountryComparisonSlots
        sortedCountries={sortedCountries}
        weights={weights}
        climatePrefs={climatePrefs}
        lang={lang}
        langPrefix={langPrefix}
        onRemove={handleRemove}
        addBtnRef={addBtnRef}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setDropdownPos={setDropdownPos}
        dropdownPos={dropdownPos}
        filteredCandidates={filtered}
        query={query}
        setQuery={setQuery}
        onAdd={handleAdd}
      />
      {selectedCountries.length > 0 ? (
        <CountryComparisonGrid
          sortedCountries={sortedCountries}
          lang={lang}
          headerRef={headerRef}
          bodyRef={bodyRef}
        />
      ) : null}
    </div>
  );
}
