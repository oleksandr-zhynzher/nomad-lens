import type { useTourismWeightState } from "@features/tourism/hooks";
import { TourismWeightPanel } from "./TourismWeightPanel";

interface TourismWeightSidebarProps {
  readonly ws: ReturnType<typeof useTourismWeightState>;
  readonly mobile?: boolean;
}

export function TourismWeightSidebar({ ws, mobile }: TourismWeightSidebarProps) {
  return (
    <TourismWeightPanel
      weights={ws.weights}
      onChange={ws.handleWeightChange}
      onReset={ws.handleReset}
      weightsAreDefault={ws.weightsAreDefault}
      budgetState={ws.budgetState}
      onBudgetChange={ws.setBudgetField}
      toggles={ws.toggles}
      onToggleFieldChange={ws.setToggleField}
      travelDates={ws.travelDates}
      onTravelDatesChange={ws.setTravelDates}
      mobile={mobile}
    />
  );
}
