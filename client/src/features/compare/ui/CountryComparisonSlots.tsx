import type { ClimatePreferences, CountryData, WeightMap } from "@core/models";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { ComparisonAddPanel } from "./ComparisonAddPanel";
import { ComparisonSlotsRow } from "./ComparisonSlotsRow";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface CountryComparisonSlotsProps {
  readonly sortedCountries: ComparisonSlot[];
  readonly weights: WeightMap;
  readonly climatePrefs: ClimatePreferences;
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

export function CountryComparisonSlots({
  sortedCountries,
  weights,
  climatePrefs,
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
}: CountryComparisonSlotsProps) {
  return (
    <>
      <ComparisonSlotsRow
        sortedCountries={sortedCountries}
        weights={weights}
        climatePrefs={climatePrefs}
        lang={lang}
        langPrefix={langPrefix}
        onRemove={onRemove}
        addBtnRef={addBtnRef}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setDropdownPos={setDropdownPos}
      />
      <ComparisonAddPanel
        dropdownOpen={dropdownOpen}
        dropdownPos={dropdownPos}
        filteredCandidates={filteredCandidates}
        climatePrefs={climatePrefs}
        weights={weights}
        lang={lang}
        query={query}
        setQuery={setQuery}
        onAdd={onAdd}
      />
    </>
  );
}
