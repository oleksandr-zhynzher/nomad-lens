import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Sphere,
  Graticule,
  Marker,
} from "react-simple-maps";
import type { RankedCountry } from "../utils/types";
import { isoNumericToAlpha2 } from "../utils/isoNumericToAlpha2";
import { countryLabelCoords } from "../utils/countryLabelCoords";
import { CountryDetailPanel } from "./CountryDetailPanel";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  ranked: RankedCountry[];
  onCountryClick: (iso2: string) => void;
}

interface HoverInfo {
  name: string;
  score: number | null;
  x: number;
  y: number;
}

export function WorldMap({ ranked, onCountryClick }: WorldMapProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Build alpha2 → ranked country map for fast lookup
  const scoreByAlpha2: Map<string, RankedCountry> = new Map(
    ranked.map((r) => [r.country.code, r]),
  );

  function geoToAlpha2(geo: { id?: unknown; properties: Record<string, unknown> }): string {
    const numeric = String(geo.id ?? "").padStart(3, "0");
    return isoNumericToAlpha2[numeric] ?? "";
  }

  function fillColour(alpha2: string): string {
    const r = scoreByAlpha2.get(alpha2);
    if (!r) return "#334155"; // slate-700, no data
    const s = r.finalScore;
    if (s >= 75) return "#4ade80"; // green-400
    if (s >= 60) return "#86efac"; // green-300
    if (s >= 50) return "#facc15"; // yellow-400
    if (s >= 38) return "#fb923c"; // orange-400
    return "#f87171"; // red-400
  }

  function handleMouseEnter(geo: { id?: unknown; properties: Record<string, unknown> }, e: React.MouseEvent) {
    const alpha2 = geoToAlpha2(geo);
    const r = scoreByAlpha2.get(alpha2);
    const name = String(geo.properties["name"] ?? alpha2);
    setHover({ name, score: r?.finalScore ?? null, x: e.clientX, y: e.clientY });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (hover) setHover((h) => h && { ...h, x: e.clientX, y: e.clientY });
  }

  function handleMouseLeave() {
    setHover(null);
  }

  function handleClick(geo: { id?: unknown; properties: Record<string, unknown> }) {
    const alpha2 = geoToAlpha2(geo);
    if (!alpha2) return;
    setHover(null);
    setSelectedCode(alpha2);
  }

  const selectedCountry = selectedCode ? (scoreByAlpha2.get(selectedCode) ?? null) : null;

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.5, 12))}
          className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-sky-400 hover:border-sky-500 transition-colors text-lg font-bold leading-none flex items-center justify-center"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-sky-400 hover:border-sky-500 transition-colors text-lg font-bold leading-none flex items-center justify-center"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([0, 20]); }}
          className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-sky-400 hover:border-sky-500 transition-colors text-xs flex items-center justify-center"
          aria-label="Reset view"
        >
          ↺
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 flex flex-col gap-1">
        <p className="text-[10px] text-slate-500 font-medium mb-0.5">Score</p>
        {[
          { color: "#4ade80", label: "75–100" },
          { color: "#86efac", label: "60–74" },
          { color: "#facc15", label: "50–59" },
          { color: "#fb923c", label: "38–49" },
          { color: "#f87171", label: "< 38" },
          { color: "#334155", label: "No data" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        width={900}
        height={460}
        style={{ width: "100%", height: "auto", background: "#0f172a" }}
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
          <Sphere fill="#0f172a" stroke="#1e293b" strokeWidth={0.5} />
          <Graticule stroke="#1e293b" strokeWidth={0.3} />
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = geoToAlpha2(geo);
                const isSelected = alpha2 === selectedCode;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColour(alpha2)}
                    stroke="#0f172a"
                    strokeWidth={isSelected ? 0 : 0.4}
                    style={{
                      default: { outline: isSelected ? "2px solid #38bdf8" : "none" },
                      hover: { outline: "none", filter: "brightness(1.25)", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e: React.MouseEvent) => handleMouseEnter(geo, e)}
                    onMouseLeave={() => handleMouseLeave()}
                    onClick={() => handleClick(geo)}
                  />
                );
              })
            }
          </Geographies>

          {/* Country name labels — only at zoom ≥ 2 */}
          {zoom >= 2 &&
            Object.entries(countryLabelCoords).map(([iso2, coords]) => {
              const r = scoreByAlpha2.get(iso2);
              const fontSize = 10 / zoom;
              const fill = r
                ? r.finalScore >= 50
                  ? "rgba(0,0,0,0.75)"
                  : "rgba(255,255,255,0.75)"
                : "rgba(255,255,255,0.45)";
              const name = r?.country.name ?? iso2;
              const displayName = name.length > 14 ? name.split(" ")[0] : name;
              return (
                <Marker key={iso2} coordinates={coords}>
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    style={{
                      fontSize,
                      fontWeight: 600,
                      fill,
                      pointerEvents: "none",
                      userSelect: "none",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {displayName}
                  </text>
                </Marker>
              );
            })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none fixed z-50 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs"
          style={{ left: hover.x + 12, top: hover.y - 10 }}
        >
          <p className="font-medium text-slate-100">{hover.name}</p>
          {hover.score !== null ? (
            <p className={`font-bold mt-0.5 ${scoreTextColour(hover.score)}`}>
              {hover.score.toFixed(1)}{" "}
              <span className="font-normal text-slate-500">/ 100</span>
            </p>
          ) : (
            <p className="text-slate-500 mt-0.5">No data</p>
          )}
        </div>
      )}

      {/* Ranked count */}
      <p className="text-xs text-slate-600 text-right mt-1 pr-1">
        {ranked.length} countries scored · click a country for details
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
  if (s >= 75) return "text-green-400";
  if (s >= 50) return "text-yellow-400";
  if (s >= 25) return "text-orange-400";
  return "text-red-400";
}
