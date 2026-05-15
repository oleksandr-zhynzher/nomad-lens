import { useTranslation } from "react-i18next";
import worldTopology from "@features/country-map/data/countries-110m.json";
import type { WorldMapProps } from "./country-map.types";
import { MapInteractiveBody } from "./MapInteractiveBody";

const WORLD_TOPOLOGY: object = worldTopology;
const MAP_SCORE_LEGEND_ITEMS = [
  { color: "#4CAF50", labelKey: "map.excellent", defaultLabel: "Excellent", range: "(75-100)" },
  { color: "#FFC107", labelKey: "map.moderate", defaultLabel: "Moderate", range: "(50-74)" },
  { color: "#FF5722", labelKey: "map.low", defaultLabel: "Low", range: "(0-49)" },
  { color: "#3A3A3A", labelKey: "map.noData", defaultLabel: "No data", range: "" },
] as const;

export function WorldMap({ ranked, onCountryClick, onToggleWeights, showWeights }: WorldMapProps) {
  const { t } = useTranslation();
  const legendItems = MAP_SCORE_LEGEND_ITEMS.map(({ color, labelKey, defaultLabel, range }) => ({
    color,
    label: t(labelKey, defaultLabel),
    range,
  }));
  return (
    <MapInteractiveBody
      ranked={ranked}
      onCountryClick={onCountryClick}
      onToggleWeights={onToggleWeights}
      showWeights={showWeights}
      legendItems={legendItems}
      worldTopology={WORLD_TOPOLOGY}
    />
  );
}
