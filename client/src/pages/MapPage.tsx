import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { WeightPanel } from "../components/WeightPanel";
import { WorldMap } from "../components/WorldMap";
import { useCountries } from "../hooks/useCountries";
import { useScoring } from "../hooks/useScoring";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useWeightState } from "../hooks/useWeightState";

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
      navigate((langPrefix || "/") + `?highlight=${iso2}`);
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
          {showWeights && (
            <div className="hidden md:block">
              <WeightPanel
                weights={ws.weights}
                onChange={ws.handleWeightChange}
                onReset={ws.handleReset}
                weightsAreDefault={ws.weightsAreDefault}
                onShare={() => ws.handleShare()}
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
          )}
          <WorldMap
            ranked={ranked}
            onCountryClick={handleCountryClick}
            onToggleWeights={() => setShowWeights((p) => !p)}
            showWeights={showWeights}
          />
        </div>
      </div>
    </Layout>
  );
}
