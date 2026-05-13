import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Sphere,
  Graticule,
} from "react-simple-maps";
import type { Geography as GeographyType } from "react-simple-maps";
import type { RankedCountry } from "@core/models";
import { localizeCountry } from "@core/utils";
import { CountryDetailPanel } from "@features/country-ranking/ui";
import worldTopology from "@features/country-map/data/countries-110m.json";
import { geoNumericToAlpha2, mapScoreToColour } from "@features/country-map/utils";
import { scoreColourClass } from "@core/utils";

const WORLD_TOPOLOGY: object = worldTopology;

interface WorldMapProps {
  readonly ranked: RankedCountry[];
  readonly onCountryClick: (iso2: string) => void;
  readonly onToggleWeights?: () => void;
  readonly showWeights?: boolean;
}

interface HoverInfo {
  name: string;
  score: number | null;
  x: number;
  y: number;
}

interface MapGeographiesProps {
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

function MapGeographies({
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

export function WorldMap({ ranked, onCountryClick, onToggleWeights, showWeights }: WorldMapProps) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Build alpha2 → ranked country map for fast lookup
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
    setHover({
      name,
      score: r?.finalScore ?? null,
      x: e.clientX,
      y: e.clientY,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (hover) setHover((h) => h && { ...h, x: e.clientX, y: e.clientY });
  }

  function handleMouseLeave() {
    setHover(null);
  }

  function handleClick(geo: { id?: unknown; properties: Record<string, unknown> }) {
    const alpha2 = geoNumericToAlpha2(geo);
    if (alpha2 === "") return;
    setHover(null);
    setSelectedCode(alpha2);
  }

  const selectedCountry = selectedCode !== null ? (scoreByAlpha2.get(selectedCode) ?? null) : null;

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      {geoLoading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#2A2A2A] border-t-accent-dim" />
        </div>
      ) : null}
      {/* Zoom controls */}
      <div className="absolute top-2 left-2 z-10 flex flex-col overflow-hidden rounded-[4px] bg-surface md:top-3 md:left-3">
        <button
          onClick={() => {
            setZoom((z) => Math.min(z * 1.5, 12));
          }}
          className="flex h-9 w-9 items-center justify-center border-b border-border text-lg leading-none font-bold text-muted transition-colors md:h-10 md:w-10"
          aria-label={t("a11y.zoomIn", "Zoom in")}
        >
          +
        </button>
        <button
          onClick={() => {
            setZoom((z) => Math.max(z / 1.5, 1));
          }}
          className={`flex h-9 w-9 items-center justify-center text-lg leading-none font-bold text-muted transition-colors md:h-10 md:w-10 ${onToggleWeights ? "border-b border-border" : ""}`}
          aria-label={t("a11y.zoomOut", "Zoom out")}
        >
          −
        </button>
        {onToggleWeights ? (
          <button
            onClick={onToggleWeights}
            className={`hidden h-10 w-10 items-center justify-center transition-colors md:flex ${showWeights ? "text-accent-dim" : "text-[#999999]"}`}
            aria-label={t("a11y.toggleParameters", "Toggle parameters")}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 hidden rounded-[4px] bg-surface md:bottom-3 md:left-3 md:flex md:flex-col md:gap-1.5 md:px-3 md:py-2">
        <p className="mb-0.5 text-[9px] font-semibold tracking-[1.5px] text-dim uppercase">
          {t("map.score")}
        </p>
        {[
          {
            color: "#4CAF50",
            label: t("map.excellent"),
            range: "(75\u2013100)",
          },
          { color: "#FFC107", label: t("map.moderate"), range: "(50\u201374)" },
          { color: "#FF5722", label: t("map.low"), range: "(0\u201349)" },
          { color: "#3A3A3A", label: t("map.noData"), range: "" },
        ].map(({ color, label, range }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-[2px] bg-[var(--legend-c)]"
              style={{ "--legend-c": color } as React.CSSProperties}
            />
            <span className="font-mono text-[10px] text-tertiary">
              {label} <span className="text-dim">{range}</span>
            </span>
          </div>
        ))}
      </div>

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
                handleMouseLeave={handleMouseLeave}
                handleClick={handleClick}
                setGeoLoading={setGeoLoading}
              />
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover tooltip */}
      {hover ? (
        <div
          className="pointer-events-none fixed top-[var(--tt-y)] left-[var(--tt-x)] z-50 rounded-[4px] bg-surface px-3 py-2 shadow-xl"
          style={
            { "--tt-x": `${hover.x + 12}px`, "--tt-y": `${hover.y - 10}px` } as React.CSSProperties
          }
        >
          <p className="text-[13px] font-semibold text-white">{hover.name}</p>
          {hover.score === null ? (
            <p className="mt-0.5 text-xs text-dim">{t("map.noData")}</p>
          ) : (
            <p
              className={`mt-0.5 font-mono text-[13px] font-semibold ${scoreColourClass(hover.score, "text")}`}
            >
              {hover.score.toFixed(1)} <span className="font-normal text-dim">/ 100</span>
            </p>
          )}
        </div>
      ) : null}

      {/* Ranked count */}
      <p className="mt-2 pr-1 text-right text-[11px] text-dimmer">
        {t("map.countriesScored", { count: ranked.length })}
      </p>

      {/* Country detail panel */}
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
