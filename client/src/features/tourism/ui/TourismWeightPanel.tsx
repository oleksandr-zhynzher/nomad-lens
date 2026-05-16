import { useTranslation } from "react-i18next";
import type React from "react";
import { PanelShell } from "@core/ui/panels";
import type { TourismWeightMap } from "@features/tourism/utils";
import type { TourismBudgetState, TourismToggles, TravelDates } from "@features/tourism/hooks";
import { useScrollIndicator } from "@features/tourism/hooks";
import { TourismBudgetSection } from "./TourismBudgetSection";
import { TourismTravelDatesSection } from "./TourismTravelDatesSection";
import { TourismMetricGroupsSection } from "./TourismMetricGroupsSection";

interface TourismWeightPanelProps {
  readonly weights: TourismWeightMap;
  readonly onChange: (key: string, value: number) => void;
  readonly onReset: () => void;
  readonly weightsAreDefault: boolean;
  readonly budgetState?: TourismBudgetState;
  readonly onBudgetChange?: <K extends keyof TourismBudgetState>(
    key: K,
    value: TourismBudgetState[K],
  ) => void;
  readonly toggles?: TourismToggles;
  readonly onToggleFieldChange?: <K extends keyof TourismToggles>(
    key: K,
    value: TourismToggles[K],
  ) => void;
  readonly travelDates?: TravelDates;
  readonly onTravelDatesChange?: React.Dispatch<React.SetStateAction<TravelDates>>;
  readonly mobile?: boolean;
}

export function TourismWeightPanel({
  weights,
  onChange,
  onReset,
  mobile,
  budgetState,
  onBudgetChange,
  toggles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleFieldChange: _onToggleFieldChange,
  travelDates,
  onTravelDatesChange,
}: TourismWeightPanelProps) {
  const { t } = useTranslation();
  const { scrollRef, onScroll } = useScrollIndicator();

  return (
    <PanelShell
      title={t("tourismWeights.title", "Tourism Weights")}
      subtitle={t(
        "tourismWeights.hint",
        "Adjust the importance of each tourism metric to personalise the ranking.",
      )}
      onReset={onReset}
      scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
      onScroll={onScroll}
      {...(mobile !== undefined && { mobile })}
    >
      {budgetState != null && onBudgetChange != null ? (
        <TourismBudgetSection budgetState={budgetState} onBudgetChange={onBudgetChange} />
      ) : null}

      {travelDates != null && onTravelDatesChange != null ? (
        <TourismTravelDatesSection
          travelDates={travelDates}
          onTravelDatesChange={onTravelDatesChange}
          {...(toggles !== undefined && { toggles })}
        />
      ) : null}

      <TourismMetricGroupsSection weights={weights} onChange={onChange} />
    </PanelShell>
  );
}
