import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@core/ui/layout";
import { WeightPanel } from "@features/country-ranking/ui";
import { WorldMap } from "@features/country-map/ui";
import { useCountries } from "@core/hooks";
import { useScoring } from "@features/country-ranking/hooks";
import { useLangPrefix } from "@core/hooks";
import { useWeightState } from "@features/country-ranking/hooks";

export function MapPage() {
  const navigate = useNavigate();
  const langPrefix = useLangPrefix();
  const [showWeights, setShowWeights] = useState(false);

  const ws = useWeightState();
  const { countries } = useCountries();
  const ranked = useScoring(
    countries,
    ws.weights,
    ws.selectedRegions,
    ws.nomadVisaOnly,
    ws.schengenOnly,
    ws.minTouristDays,
    ws.climatePrefs,
  );

  const handleCountryClick = useCallback(
    (iso2: string) => {
      void navigate((langPrefix !== "" ? langPrefix : "/") + `?highlight=${iso2}`);
    },
    [navigate, langPrefix],
  );

  return (
    <Layout>
      <div className="px-2 py-2 md:px-6 md:py-6">
        <div
          className={`grid gap-4 md:gap-6 ${
            showWeights ? "grid-cols-1 lg:grid-cols-[340px_1fr]" : "grid-cols-1"
          }`}
        >
          {showWeights ? (
            <div className="hidden md:block">
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
              />
            </div>
          ) : null}
          <WorldMap
            ranked={ranked}
            onCountryClick={handleCountryClick}
            onToggleWeights={() => {
              setShowWeights((p) => !p);
            }}
            showWeights={showWeights}
          />
        </div>
      </div>
    </Layout>
  );
}
