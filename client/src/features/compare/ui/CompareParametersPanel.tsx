import type { useBudgetState } from "@features/budget/hooks";
import { BudgetFilterPanel } from "@features/budget/ui";
import type { CompareMode } from "@features/compare/utils";
import type { useWeightState } from "@features/country-ranking/hooks";
import { WeightPanel } from "@features/country-ranking/ui";
import type { useTourismWeightState } from "@features/tourism/hooks";
import { TourismWeightPanel } from "@features/tourism/ui";

interface CompareParametersPanelProps {
  readonly compareMode: CompareMode;
  readonly rankingState: ReturnType<typeof useWeightState>;
  readonly tourismState: ReturnType<typeof useTourismWeightState>;
  readonly budgetState: ReturnType<typeof useBudgetState>;
  readonly onShare: () => void;
  readonly mobile?: boolean;
}

function RankingWeightPanel({
  rankingState,
  onShare,
  mobile,
}: {
  readonly rankingState: ReturnType<typeof useWeightState>;
  readonly onShare: () => void;
  readonly mobile?: boolean;
}) {
  return (
    <WeightPanel
      weights={rankingState.weights}
      onChange={rankingState.handleWeightChange}
      onReset={rankingState.handleReset}
      weightsAreDefault={rankingState.weightsAreDefault}
      onShare={onShare}
      climatePrefs={rankingState.climatePrefs}
      onClimatePrefsChange={rankingState.setClimatePrefs}
      nomadVisaOnly={rankingState.nomadVisaOnly}
      onNomadVisaOnlyChange={rankingState.setNomadVisaOnly}
      schengenOnly={rankingState.schengenOnly}
      onSchengenOnlyChange={rankingState.setSchengenOnly}
      minTouristDays={rankingState.minTouristDays}
      onMinTouristDaysChange={rankingState.setMinTouristDays}
      weightMode={rankingState.weightMode}
      onWeightModeChange={rankingState.handleWeightModeChange}
      {...(mobile !== undefined && { mobile })}
    />
  );
}

export function CompareParametersPanel({
  compareMode,
  rankingState,
  tourismState,
  budgetState,
  onShare,
  mobile,
}: CompareParametersPanelProps) {
  if (compareMode === "tourism") {
    return (
      <TourismWeightPanel
        weights={tourismState.weights}
        onChange={tourismState.handleWeightChange}
        onReset={tourismState.handleReset}
        weightsAreDefault={tourismState.weightsAreDefault}
        budgetState={tourismState.budgetState}
        onBudgetChange={tourismState.setBudgetField}
        {...(mobile !== undefined && { mobile })}
      />
    );
  }

  if (compareMode === "budget") {
    return <BudgetFilterPanel bs={budgetState} />;
  }

  if (compareMode === "nomadVisas") {
    return (
      <div className="flex flex-col gap-4">
        <RankingWeightPanel
          rankingState={rankingState}
          onShare={onShare}
          {...(mobile !== undefined && { mobile })}
        />
        <BudgetFilterPanel bs={budgetState} />
      </div>
    );
  }

  return (
    <RankingWeightPanel
      rankingState={rankingState}
      onShare={onShare}
      {...(mobile !== undefined && { mobile })}
    />
  );
}
