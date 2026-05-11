import { BudgetFilterPanel } from "../../../components/BudgetFilterPanel";
import { TourismWeightPanel } from "../../../components/TourismWeightPanel";
import { WeightPanel } from "../../../components/WeightPanel";
import type { useBudgetState } from "../../../hooks/useBudgetState";
import type { useTourismWeightState } from "../../../hooks/useTourismWeightState";
import type { useWeightState } from "../../../hooks/useWeightState";
import type { CompareMode } from "../model/compareUrlState";

interface CompareParametersPanelProps {
  compareMode: CompareMode;
  rankingState: ReturnType<typeof useWeightState>;
  tourismState: ReturnType<typeof useTourismWeightState>;
  budgetState: ReturnType<typeof useBudgetState>;
  onShare: () => void;
  mobile?: boolean;
}

function RankingWeightPanel({
  rankingState,
  onShare,
  mobile,
}: {
  rankingState: ReturnType<typeof useWeightState>;
  onShare: () => void;
  mobile?: boolean;
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
      mobile={mobile}
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
        mobile={mobile}
      />
    );
  }

  if (compareMode === "budget") {
    return <BudgetFilterPanel bs={budgetState} />;
  }

  if (compareMode === "nomadVisas") {
    return (
      <div className="flex flex-col gap-4">
        <RankingWeightPanel rankingState={rankingState} onShare={onShare} mobile={mobile} />
        <BudgetFilterPanel bs={budgetState} />
      </div>
    );
  }

  return <RankingWeightPanel rankingState={rankingState} onShare={onShare} mobile={mobile} />;
}
