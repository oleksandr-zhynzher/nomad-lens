import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { localizeCountry, regionKey, tourismScoreColourClass } from "@core/utils";
import { computeTourismScore } from "@features/tourism/utils";
import { useLangPrefix } from "@core/hooks";
import { useSyncScroll, useComparisonSelection } from "@features/compare/hooks";
import { CountryPickerDropdown } from "./CountryPickerDropdown";
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
  const { t, i18n } = useTranslation();
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
      />
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filtered.map((c) => {
          const score = computeTourismScore(c);
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span
                className={`font-mono text-[13px] font-semibold ${score == null ? "text-border" : tourismScoreColourClass(score, "text")}`}
              >
                {score == null ? "—" : score.toFixed(1)}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        position={dropdownPos ?? undefined}
        inputName="tourism-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
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
