import type { CountryData } from "@core/models";
import type { BudgetMatch } from "@features/budget/hooks";
import { useComparisonSelection, useSyncScroll } from "@features/compare/hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BudgetComparisonGrid } from "./BudgetComparisonGrid";
import { BudgetComparisonSlots } from "./BudgetComparisonSlots";

const EMPTY_BUDGET_MATCHES: BudgetMatch[] = [];

interface BudgetComparisonProps {
  readonly countries: CountryData[];
  readonly matches?: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection?: "desc" | "asc" | null;
}

export function BudgetComparison({
  countries,
  matches = EMPTY_BUDGET_MATCHES,
  selectedCodes,
  onSelectedCodesChange,
  sortDirection = null,
}: BudgetComparisonProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const matchMap = useMemo(() => new Map(matches.map((m) => [m.country.code, m])), [matches]);
  const {
    selectedSlots,
    handleAdd,
    handleRemove,
    filteredCandidates: hookFiltered,
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
  });
  useSyncScroll(headerRef, bodyRef);
  const filtered = hookFiltered.filter((c) => !!c.costOfLiving);
  const sortedSlots = useMemo(() => {
    if (sortDirection == null) return selectedSlots;
    return selectedSlots.toSorted((slotA, slotB) => {
      const matchA = matchMap.get(slotA.country.code);
      const matchB = matchMap.get(slotB.country.code);
      if (!matchA && !matchB) return 0;
      if (!matchA) return sortDirection === "desc" ? 1 : -1;
      if (!matchB) return sortDirection === "desc" ? -1 : 1;
      if (matchA.monthlyCost !== matchB.monthlyCost) {
        const costDelta = matchB.monthlyCost - matchA.monthlyCost;
        return sortDirection === "desc" ? costDelta : -costDelta;
      }
      return sortDirection === "desc"
        ? matchB.surplus - matchA.surplus
        : matchA.surplus - matchB.surplus;
    });
  }, [selectedSlots, sortDirection, matchMap]);
  return (
    <div>
      <BudgetComparisonSlots
        sortedSlots={sortedSlots}
        matchMap={matchMap}
        lang={lang}
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
      {selectedSlots.length > 0 ? (
        <BudgetComparisonGrid
          sortedSlots={sortedSlots}
          matchMap={matchMap}
          headerRef={headerRef}
          bodyRef={bodyRef}
          lang={lang}
        />
      ) : null}
    </div>
  );
}
