import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData, WeightMap, ClimatePreferences } from "@core/models";
import { localizeCountry, regionKey, scoreColourClass } from "@core/utils";
import { applyClimate, computeScore } from "@features/country-ranking/utils";
import { CountryPickerDropdown } from "./CountryPickerDropdown";

interface ComparisonAddPanelProps {
  readonly dropdownOpen: boolean;
  readonly dropdownPos: { top: number; left: number } | null;
  readonly filteredCandidates: CountryData[];
  readonly climatePrefs: ClimatePreferences;
  readonly weights: WeightMap;
  readonly lang: string;
  readonly query: string;
  readonly setQuery: Dispatch<SetStateAction<string>>;
  readonly onAdd: (code: string) => void;
}

export function ComparisonAddPanel({
  dropdownOpen,
  dropdownPos,
  filteredCandidates,
  climatePrefs,
  weights,
  lang,
  query,
  setQuery,
  onAdd,
}: ComparisonAddPanelProps) {
  const { t } = useTranslation();
  return (
    <CountryPickerDropdown
      open={dropdownOpen ? dropdownPos != null : false}
      countries={filteredCandidates.map((c) => {
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
      onSelect={onAdd}
      position={dropdownPos ?? undefined}
      inputName="country-comparison-search"
      searchPlaceholder={t("compare.searchCountry")}
      emptyLabel={t("compare.noCountriesFound")}
    />
  );
}
