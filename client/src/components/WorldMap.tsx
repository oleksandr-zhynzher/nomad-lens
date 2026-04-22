import { useEffect, useState } from "react";
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
import type { RankedCountry } from "../utils/types";
import { localizeCountry } from "../utils/localize";
import { isoNumericToAlpha2 } from "../utils/isoNumericToAlpha2";
import { CountryDetailPanel } from "./CountryDetailPanel";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  ranked: RankedCountry[];
  onCountryClick: (iso2: string) => void;
  onToggleWeights?: () => void;
  showWeights?: boolean;
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
  fillColour: (alpha2: string) => string;
  geoToAlpha2: (geo: {
    id?: unknown;
    properties: Record<string, unknown>;
  }) => string;
  handleMouseEnter: (
    geo: { id?: unknown; properties: Record<string, unknown> },
    e: React.MouseEvent,
  ) => void;
  handleMouseLeave: () => void;
  handleClick: (geo: {
    id?: unknown;
    properties: Record<string, unknown>;
  }) => void;
  setGeoLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

function MapGeographies({
  geographies,
  geoLoading,
  selectedCode,
  zoom,
  fillColour,
  geoToAlpha2,
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
    const alpha2 = geoToAlpha2(
      geo as { id?: unknown; properties: Record<string, unknown> },
    );
    const isSelected = alpha2 === selectedCode;

    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        fill={fillColour(alpha2)}
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
        onMouseEnter={(e: React.MouseEvent) =>
          handleMouseEnter(
            geo as { id?: unknown; properties: Record<string, unknown> },
            e,
          )
        }
        onMouseLeave={() => handleMouseLeave()}
        onClick={() =>
          handleClick(
            geo as { id?: unknown; properties: Record<string, unknown> },
          )
        }
      />
    );
  });
}

export function WorldMap({
  ranked,
  onCountryClick,
  onToggleWeights,
  showWeights,
}: WorldMapProps) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Build alpha2 → ranked country map for fast lookup
  const scoreByAlpha2: Map<string, RankedCountry> = new Map(
    ranked.map((r) => [r.country.code, r]),
  );

  function geoToAlpha2(geo: {
    id?: unknown;
    properties: Record<string, unknown>;
  }): string {
    const numeric = String(geo.id ?? "").padStart(3, "0");
    return isoNumericToAlpha2[numeric] ?? "";
  }

  function fillColour(alpha2: string): string {
    const r = scoreByAlpha2.get(alpha2);
    if (!r) return "#3A3A3A"; // No data
    const s = r.finalScore;
    if (s >= 75) return "#4CAF50"; // Excellent - green
    if (s >= 50) return "#FFC107"; // Moderate - amber
    return "#FF5722"; // Low - red-orange
  }

  function handleMouseEnter(
    geo: { id?: unknown; properties: Record<string, unknown> },
    e: React.MouseEvent,
  ) {
    const alpha2 = geoToAlpha2(geo);
    const r = scoreByAlpha2.get(alpha2);
    const name = r
      ? localizeCountry(r.country, i18n.language).name
      : String(geo.properties["name"] ?? alpha2);
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

  function handleClick(geo: {
    id?: unknown;
    properties: Record<string, unknown>;
  }) {
    const alpha2 = geoToAlpha2(geo);
    if (!alpha2) return;
    setHover(null);
    setSelectedCode(alpha2);
  }

  const selectedCountry = selectedCode
    ? (scoreByAlpha2.get(selectedCode) ?? null)
    : null;

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      {geoLoading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ backgroundColor: "#000000" }}
        >
          <div
            className="animate-spin"
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #2A2A2A",
              borderTopColor: "var(--color-accent-dim)",
              borderRadius: "50%",
            }}
          />
        </div>
      )}
      {/* Zoom controls */}
      <div
        className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col overflow-hidden"
        style={{ backgroundColor: "#1A1A1A", borderRadius: "4px" }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.5, 12))}
          className="w-9 h-9 md:w-10 md:h-10 text-lg font-bold leading-none flex items-center justify-center transition-colors"
          style={{ color: "#9E9E9E", borderBottom: "1px solid #333333" }}
          aria-label={t("a11y.zoomIn", "Zoom in")}
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          className="w-9 h-9 md:w-10 md:h-10 text-lg font-bold leading-none flex items-center justify-center transition-colors"
          style={{
            color: "#9E9E9E",
            borderBottom: onToggleWeights ? "1px solid #333333" : undefined,
          }}
          aria-label={t("a11y.zoomOut", "Zoom out")}
        >
          −
        </button>
        {onToggleWeights && (
          <button
            onClick={onToggleWeights}
            className="hidden md:flex w-10 h-10 items-center justify-center transition-colors"
            style={{
              color: showWeights ? "var(--color-accent-dim)" : "#999999",
            }}
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
        )}
      </div>

      {/* Legend */}
      <div
        className="hidden absolute bottom-2 left-2 z-10 md:bottom-3 md:left-3 md:flex md:flex-col md:gap-1.5 md:px-3 md:py-2"
        style={{ backgroundColor: "#1A1A1A", borderRadius: "4px" }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#8A8A8A",
            marginBottom: "2px",
          }}
        >
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
              className="w-3 h-3 shrink-0"
              style={{ background: color, borderRadius: "2px" }}
            />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "10px",
                color: "#CCCCCC",
              }}
            >
              {label} <span style={{ color: "#8A8A8A" }}>{range}</span>
            </span>
          </div>
        ))}
      </div>

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        width={900}
        height={460}
        style={{ width: "100%", height: "auto", background: "#000000" }}
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
          <Sphere fill="#000000" stroke="#1A1A1A" strokeWidth={0.5} />
          <Graticule stroke="#1A1A1A" strokeWidth={0.3} />
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <MapGeographies
                geographies={geographies}
                geoLoading={geoLoading}
                selectedCode={selectedCode}
                zoom={zoom}
                fillColour={fillColour}
                geoToAlpha2={geoToAlpha2}
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
      {hover && (
        <div
          className="pointer-events-none fixed z-50 px-3 py-2 shadow-xl rounded"
          style={{
            left: hover.x + 12,
            top: hover.y - 10,
            backgroundColor: "#1A1A1A",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            {hover.name}
          </p>
          {hover.score !== null ? (
            <p
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "13px",
                fontWeight: 600,
                marginTop: "2px",
                color: scoreTextColour(hover.score),
              }}
            >
              {hover.score.toFixed(1)}{" "}
              <span style={{ fontWeight: 400, color: "#8A8A8A" }}>/ 100</span>
            </p>
          ) : (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#8A8A8A",
                marginTop: "2px",
              }}
            >
              {t("map.noData")}
            </p>
          )}
        </div>
      )}

      {/* Ranked count */}
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "#808080",
          textAlign: "right",
          marginTop: "8px",
          paddingRight: "4px",
        }}
      >
        {t("map.countriesScored", { count: ranked.length })}
      </p>

      {/* Country detail panel */}
      {selectedCountry && (
        <CountryDetailPanel
          country={selectedCountry}
          onClose={() => setSelectedCode(null)}
          onViewInList={() => onCountryClick(selectedCountry.country.code)}
        />
      )}
    </div>
  );
}

function scoreTextColour(s: number): string {
  if (s >= 75) return "#4CAF50";
  if (s >= 60) return "#8BC34A";
  if (s >= 50) return "#FFC107";
  return "#FF5722";
}
