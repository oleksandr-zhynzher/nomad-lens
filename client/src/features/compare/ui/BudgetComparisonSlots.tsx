import type { CountryData } from "@core/models";
import type { BudgetMatch } from "@features/budget/hooks";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { BudgetComparisonAddPanel } from "./BudgetComparisonAddPanel";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface BudgetComparisonSlotsProps {
  readonly sortedSlots: ComparisonSlot[];
  readonly matchMap: Map<string, BudgetMatch>;
  readonly lang: string;
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

export function BudgetComparisonSlots({
  sortedSlots,
  matchMap,
  lang,
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
}: BudgetComparisonSlotsProps) {
  return (
    <BudgetComparisonAddPanel
      sortedSlots={sortedSlots}
      matchMap={matchMap}
      lang={lang}
      onRemove={onRemove}
      addBtnRef={addBtnRef}
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      setDropdownPos={setDropdownPos}
      dropdownPos={dropdownPos}
      filteredCandidates={filteredCandidates}
      query={query}
      setQuery={setQuery}
      onAdd={onAdd}
    />
  );
}
