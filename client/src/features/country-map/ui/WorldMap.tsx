import { useMemo, useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { ComposableMap, Geographies, ZoomableGroup, Sphere, Graticule } from "react-simple-maps";
import { localizeCountry } from "@core/utils";
import { CountryDetailPanel } from "@features/country-ranking/ui";
import worldTopology from "@features/country-map/data/countries-110m.json";
import { geoNumericToAlpha2 } from "@features/country-map/utils";
import { MapGeographies } from "./MapGeographies";
import { MapZoomControls, MapLegend } from "./MapControls";
import { MapHoverTooltip } from "./MapHoverTooltip";
import type { WorldMapProps, HoverInfo } from "./country-map.types";

const WORLD_TOPOLOGY: object = worldTopology;
const MAP_SCORE_LEGEND_ITEMS = [
  { color: "#4CAF50", labelKey: "map.excellent", defaultLabel: "Excellent", range: "(75-100)" },
  { color: "#FFC107", labelKey: "map.moderate", defaultLabel: "Moderate", range: "(50-74)" },
  { color: "#FF5722", labelKey: "map.low", defaultLabel: "Low", range: "(0-49)" },
  { color: "#3A3A3A", labelKey: "map.noData", defaultLabel: "No data", range: "" },
] as const;

export function WorldMap({ ranked, onCountryClick, onToggleWeights, showWeights }: WorldMapProps) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  const scoreByAlpha2 = useMemo(() => new Map(ranked.map((r) => [r.country.code, r])), [ranked]);

  function handleMouseEnter(
    geo: { id?: unknown; properties: Record<string, unknown> },
    e: React.MouseEvent,
  ) {
    const alpha2 = geoNumericToAlpha2(geo);
    const r = scoreByAlpha2.get(alpha2);
    const name = r
      ? localizeCountry(r.country, i18n.language).name
      : typeof geo.properties.name === "string"
        ? geo.properties.name
        : alpha2;
    setHover({ name, score: r?.finalScore ?? null, x: e.clientX, y: e.clientY });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (hover) setHover((h) => h && { ...h, x: e.clientX, y: e.clientY });
  }

  function handleClick(geo: { id?: unknown; properties: Record<string, unknown> }) {
    const alpha2 = geoNumericToAlpha2(geo);
    if (alpha2 === "") return;
    setHover(null);
    setSelectedCode(alpha2);
  }

  const selectedCountry = selectedCode !== null ? (scoreByAlpha2.get(selectedCode) ?? null) : null;
  const legendItems = MAP_SCORE_LEGEND_ITEMS.map(({ color, labelKey, defaultLabel, range }) => ({
    color,
    label: t(labelKey, defaultLabel),
    range,
  }));

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      {geoLoading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#2A2A2A] border-t-accent-dim" />
        </div>
      ) : null}
      <MapZoomControls
        zoom={zoom}
        onZoomIn={() => {
          setZoom((z) => Math.min(z * 1.5, 12));
        }}
        onZoomOut={() => {
          setZoom((z) => Math.max(z / 1.5, 1));
        }}
        onToggleWeights={onToggleWeights}
        showWeights={showWeights}
      />
      <MapLegend items={legendItems} scoreLabel={t("map.score")} />
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        width={900}
        height={460}
        className="h-auto w-full bg-[#0A0A0F]"
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={(pos: unknown) => {
            const p = pos as { coordinates: [number, number]; zoom: number };
            setCenter(p.coordinates);
            setZoom(p.zoom);
          }}
        >
          <Sphere fill="#0A0A0F" stroke="#1A1A1A" strokeWidth={0.5} />
          <Graticule stroke="#1A1A1A" strokeWidth={0.3} />
          <Geographies geography={WORLD_TOPOLOGY}>
            {({ geographies }) => (
              <MapGeographies
                geographies={geographies}
                geoLoading={geoLoading}
                selectedCode={selectedCode}
                zoom={zoom}
                scoreByAlpha2={scoreByAlpha2}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={() => {
                  setHover(null);
                }}
                handleClick={handleClick}
                setGeoLoading={setGeoLoading}
              />
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {hover ? (
        <MapHoverTooltip name={hover.name} score={hover.score} x={hover.x} y={hover.y} />
      ) : null}
      <p className="mt-2 pr-1 text-right text-[11px] text-dimmer">
        {t("map.countriesScored", { count: ranked.length })}
      </p>
      {selectedCountry ? (
        <CountryDetailPanel
          country={selectedCountry}
          onClose={() => {
            setSelectedCode(null);
          }}
          onViewInList={() => {
            onCountryClick(selectedCountry.country.code);
          }}
        />
      ) : null}
    </div>
  );
}
