import type { CountryData } from "@core/models";
import { localizeCountry, regionKey, tourismScoreColourClass } from "@core/utils";
import { computeTourismScore } from "@features/tourism/utils";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { CountryPickerDropdown } from "./CountryPickerDropdown";
import { TourismComparisonPanel } from "./TourismComparisonPanel";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface TourismComparisonSlotsProps {
  readonly sortedCountries: ComparisonSlot[];
  readonly lang: string;
  readonly langPrefix: string;
  readonly onRemove: (index: number) => void;
  readonly addBtnRef: RefObject<HTMLDivElement | null>;
  readonly dropdownOpen: boolean;
  readonly setDropdownOpen: Dispatch<SetStateAction<boolean>>;
  readonly setDropdownPos: Dispatch<SetStateAction<{ top: number; left: number } | null>>;
  readonly dropdownPos: { top: number; left: number } | null;
  readonly filteredCandidates: CountryData[];
  readonly query: string;
  readonly setQuery: Dispatch<SetStateAction<string>>;
  readonly onAdd: (code: string) => void;
}

export function TourismComparisonSlots({
  sortedCountries,
  lang,
  langPrefix,
  onRemove,
  addBtnRef,
  dropdownOpen,
  setDropdownOpen,
  setDropdownPos,
  dropdownPos,
  filteredCandidates,
  query,
  setQuery,
  onAdd,
}: TourismComparisonSlotsProps) {
  const { t } = useTranslation();
  return (
    <>
      <TourismComparisonPanel
        sortedCountries={sortedCountries}
        lang={lang}
        langPrefix={langPrefix}
        onRemove={onRemove}
        addBtnRef={addBtnRef}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setDropdownPos={setDropdownPos}
      />
      <CountryPickerDropdown
        open={dropdownOpen ? dropdownPos != null : false}
        countries={filteredCandidates.map((c) => {
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
        onSelect={onAdd}
        {...(dropdownPos !== null && { position: dropdownPos })}
        inputName="tourism-comparison-search"
        searchPlaceholder={t("compare.searchCountry")}
        emptyLabel={t("compare.noCountriesFound")}
      />
    </>
  );
}
