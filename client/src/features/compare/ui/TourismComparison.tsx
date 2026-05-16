import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { computeTourismScore } from "@features/tourism/utils";
import { useLangPrefix } from "@core/hooks";
import { useSyncScroll, useComparisonSelection } from "@features/compare/hooks";
import { TourismComparisonSlots } from "./TourismComparisonSlots";
import { TourismComparisonGrid } from "./TourismComparisonGrid";

interface TourismComparisonProps {
  readonly countries: CountryData[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection?: "desc" | "asc" | null;
  readonly onSelectionCount?: (count: number) => void;
}

export function TourismComparison({
  countries,
  selectedCodes,
  onSelectedCodesChange,
  sortDirection = null,
  onSelectionCount,
}: TourismComparisonProps) {
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
    ...(onSelectionCount !== undefined && { onSelectionCount }),
  });

  useSyncScroll(headerRef, bodyRef);

  const sortedCountries = useMemo(() => {
    if (sortDirection == null) return selectedCountries;
    return [...selectedCountries].sort((slotA, slotB) => {
      const scoreA = computeTourismScore(slotA.country) ?? 0;
      const scoreB = computeTourismScore(slotB.country) ?? 0;
      return sortDirection === "desc" ? scoreB - scoreA : scoreA - scoreB;
    });
  }, [selectedCountries, sortDirection]);

  return (
    <div>
      <TourismComparisonSlots
        sortedCountries={sortedCountries}
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
        <TourismComparisonGrid
          sortedCountries={sortedCountries}
          lang={lang}
          headerRef={headerRef}
          bodyRef={bodyRef}
        />
      ) : null}
    </div>
  );
}
