import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import type { CountryData, WeightMap, ClimatePreferences } from "@core/models";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { scoreColourClass } from "@core/utils";
import { localizeCountry, regionKey } from "@core/utils";
import { useSyncScroll, useComparisonSelection } from "@features/compare/hooks";
import { CountryPickerDropdown } from "./CountryPickerDropdown";
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
      />
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filtered.map((c) => {
          const score = computeScore(applyClimate(c, climatePrefs), weights);
          return {
            code: c.code,
            flagUrl: c.flagUrl,
            name: localizeCountry(c, lang).name,
            regionLabel: t(`regions.${regionKey(c.region)}`),
            trailing: (
              <span
                className={`font-mono text-[13px] font-semibold ${scoreColourClass(score, "text")}`}
              >
                {score.toFixed(1)}
              </span>
            ),
          };
        })}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleAdd}
        position={dropdownPos ?? undefined}
        inputName="country-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
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
