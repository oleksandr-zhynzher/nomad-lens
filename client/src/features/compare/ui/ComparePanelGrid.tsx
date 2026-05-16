import type { CountryData } from "@core/models";
import type { BudgetMatch, useBudgetState } from "@features/budget/hooks";
import type { CompareMode, SortDirection } from "@features/compare/utils";
import type { useWeightState } from "@features/country-ranking/hooks";
import type { useTourismWeightState } from "@features/tourism/hooks";
import type { RefObject } from "react";

import { ComparePanel } from "./ComparePanel";
import { CompareParametersPanel } from "./CompareParametersPanel";

interface ComparePanelGridProps {
  readonly showWeights: boolean;
  readonly panelRef: RefObject<HTMLDivElement | null>;
  readonly compareMode: CompareMode;
  readonly rankingState: ReturnType<typeof useWeightState>;
  readonly tourismState: ReturnType<typeof useTourismWeightState>;
  readonly budgetState: ReturnType<typeof useBudgetState>;
  readonly onShare: () => void;
  readonly countries: CountryData[];
  readonly budgetMatches: BudgetMatch[];
  readonly selectedCodes: string[];
  readonly onSelectedCodesChange: (codes: string[]) => void;
  readonly sortDirection: SortDirection;
  readonly onSelectionCount: (count: number) => void;
}

export function ComparePanelGrid({
  showWeights,
  panelRef,
  compareMode,
  rankingState,
  tourismState,
  budgetState,
  onShare,
  countries,
  budgetMatches,
  selectedCodes,
  onSelectedCodesChange,
  sortDirection,
  onSelectionCount,
}: ComparePanelGridProps) {
  return (
    <div
      className={`grid gap-4 md:gap-6 ${showWeights ? "grid-cols-1 lg:grid-cols-[340px_1fr]" : "grid-cols-1"}`}
    >
      {showWeights ? (
        <div
          ref={panelRef}
          className={`sticky top-4 hidden rounded-lg md:block ${compareMode === "budget" || compareMode === "nomadVisas" ? "overflow-auto" : "overflow-hidden"}`}
        >
          <CompareParametersPanel
            compareMode={compareMode}
            rankingState={rankingState}
            tourismState={tourismState}
            budgetState={budgetState}
            onShare={onShare}
          />
        </div>
      ) : null}
      <div className="min-w-0">
        <ComparePanel
          compareMode={compareMode}
          countries={countries}
          weights={rankingState.weights}
          climatePrefs={rankingState.climatePrefs}
          budgetMatches={budgetMatches}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          sortDirection={sortDirection}
          onSelectionCount={onSelectionCount}
        />
      </div>
    </div>
  );
}
