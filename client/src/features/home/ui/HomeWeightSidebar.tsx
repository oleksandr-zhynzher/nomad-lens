import type { useWeightState } from "@features/country-ranking/hooks";
import { WeightPanel } from "@features/country-ranking/ui";

interface HomeWeightSidebarProps {
  readonly ws: ReturnType<typeof useWeightState>;
  readonly mobile?: boolean;
}

export function HomeWeightSidebar({ ws, mobile }: HomeWeightSidebarProps) {
  return (
    <WeightPanel
      weights={ws.weights}
      onChange={ws.handleWeightChange}
      onReset={ws.handleReset}
      weightsAreDefault={ws.weightsAreDefault}
      onShare={() => {
        ws.handleShare();
      }}
      climatePrefs={ws.climatePrefs}
      onClimatePrefsChange={ws.setClimatePrefs}
      nomadVisaOnly={ws.nomadVisaOnly}
      onNomadVisaOnlyChange={ws.setNomadVisaOnly}
      schengenOnly={ws.schengenOnly}
      onSchengenOnlyChange={ws.setSchengenOnly}
      minTouristDays={ws.minTouristDays}
      onMinTouristDaysChange={ws.setMinTouristDays}
      weightMode={ws.weightMode}
      onWeightModeChange={ws.handleWeightModeChange}
      mobile={mobile}
    />
  );
}
