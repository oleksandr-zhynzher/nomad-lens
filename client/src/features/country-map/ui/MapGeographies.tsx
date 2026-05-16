import type { RankedCountry } from "@core/models";
import { geoNumericToAlpha2, mapScoreToColour } from "@features/country-map/utils";
import type React from "react";
import { useEffect } from "react";
import type { Geography as GeographyType } from "react-simple-maps";
import { Geography } from "react-simple-maps";

export interface MapGeographiesProps {
  geographies: GeographyType[];
  geoLoading: boolean;
  selectedCode: string | null;
  zoom: number;
  scoreByAlpha2: Map<string, RankedCountry>;
  handleMouseEnter: (
    geo: { id?: unknown; properties: Record<string, unknown> },
    e: React.MouseEvent,
  ) => void;
  handleMouseLeave: () => void;
  handleClick: (geo: { id?: unknown; properties: Record<string, unknown> }) => void;
  setGeoLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapGeographies({
  geographies,
  geoLoading,
  selectedCode,
  zoom,
  scoreByAlpha2,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  setGeoLoading,
}: MapGeographiesProps) {
  useEffect(() => {
    if (geoLoading && geographies.length > 0) {
      setGeoLoading(false);
    }
  }, [geoLoading, geographies.length, setGeoLoading]);

  return geographies.map((geo) => {
    const alpha2 = geoNumericToAlpha2(geo);
    const isSelected = alpha2 === selectedCode;

    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        fill={mapScoreToColour(scoreByAlpha2.get(alpha2)?.finalScore)}
        stroke={isSelected ? "var(--color-accent)" : "#0F1114"}
        strokeWidth={isSelected ? 1.5 / zoom : 0.4}
        style={{
          default: { outline: "none" },
          hover: {
            outline: "none",
            filter: "brightness(1.25)",
            cursor: "pointer",
          },
          pressed: { outline: "none" },
        }}
        onMouseEnter={(e: React.MouseEvent) => {
          handleMouseEnter(geo, e);
        }}
        onMouseLeave={() => {
          handleMouseLeave();
        }}
        onClick={() => {
          handleClick(geo);
        }}
      />
    );
  });
}
