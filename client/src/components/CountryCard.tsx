import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { RankedCountry, SeasonType } from "../utils/types";
import {
  CATEGORY_ABBREVS,
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface CountryCardProps {
  ranked: RankedCountry;
  highlighted?: boolean;
  index: number;
}

export function CountryCard({ ranked, highlighted = false, index }: CountryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { country, finalScore, rank } = ranked;
  
  // Alternating backgrounds
  const isEven = index % 2 === 0;
  const bgColor = isEven ? "#0F1012" : "#0C0D0E";
  const borderColor = isEven ? "#1C1D1F" : "#161718";

  return (
    <div
      data-country-code={country.code}
      className={`overflow-hidden transition-all duration-700 ${
        highlighted ? "ring-2 ring-sky-400" : ""
      }`}
      style={{ backgroundColor: bgColor, borderTop: `1px solid ${borderColor}` }}
    >
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 px-4 py-3 hover:brightness-110 transition-all text-left"
        style={{ height: "64px" }}
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "18px", fontWeight: 700, color: "var(--color-accent)", width: "32px", textAlign: "center" }}>
          {rank}
        </span>

        {/* Flag */}
        <img
          src={country.flagUrl}
          alt={`${country.name} flag`}
          className="object-cover shrink-0"
          style={{ width: "28px", height: "19px", borderRadius: "2px" }}
          loading="lazy"
        />

        {/* Name + region + badges */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#FFFFFF" }}>
              {country.name}
            </p>
            <span style={{ fontFamily: "Geist, sans-serif", fontSize: "11px", color: "#555555" }}>
              {country.region}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {country.hasNomadVisa && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2A1A0E", border: "1px solid #5A3010", fontFamily: "Geist, sans-serif", fontSize: "10px", color: "var(--color-accent-dim)" }}>
                ✈ Nomad Visa
              </span>
            )}
            {country.climateData && (() => {
              const badge = SEASON_BADGE[country.climateData.seasonType];
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, border: `1px solid ${badge.stroke}`, fontFamily: "Geist, sans-serif", fontSize: "10px", color: badge.text }}>
                  {badge.icon} {badge.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Sparkline dots */}
        <div className="hidden sm:flex gap-1 items-center">
          {CATEGORY_KEYS.map((key) => {
            const val = country.scores[key]?.value ?? null;
            return (
              <div
                key={key}
                className="rounded-full"
                style={{ width: "6px", height: "6px", backgroundColor: dotColour(val) }}
              />
            );
          })}
        </div>

        {/* Final score */}
        <div className="shrink-0">
          <span className={scoreColour(finalScore)} style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "22px", fontWeight: 700 }}>
            {finalScore.toFixed(1)}
          </span>
        </div>

        {/* Chevron */}
        <ChevronRight size={20} style={{ color: "#333333" }} className="shrink-0" />
      </button>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="px-4 py-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <ScoreBreakdown country={country} />
        </div>
      )}
    </div>
  );
}
                    <p className="text-slate-400 mb-1.5">{CATEGORY_DESCRIPTIONS[key]}</p>
                    <p className="text-slate-600 border-t border-slate-700 pt-1.5">
                      <span className="text-slate-700">Source: </span>{CATEGORY_DATA_SOURCES[key]}
                    </p>
                  </>
                }
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`w-2 h-2 rounded-full ${dotColour(val)}`} />
                  <span className="hidden lg:block text-[8px] text-slate-600 font-mono leading-none">
                    {CATEGORY_ABBREVS[key]}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* Final score */}
        <div className="text-right shrink-0 w-14">
          <span className={`text-lg font-bold ${scoreColour(finalScore)}`}>
            {finalScore.toFixed(1)}
          </span>
          <p className="text-xs text-slate-500">/ 100</p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-slate-700 px-4 py-4">
          <ScoreBreakdown country={country} />
        </div>
      )}
    </div>
  );
}

function dotColour(value: number | null): string {
  if (value === null) return "#3A3A3A";
  if (value >= 75) return "#4CAF50";
  if (value >= 60) return "#8BC34A";
  if (value >= 50) return "#FFC107";
  return "#FF5722";
}

const SEASON_BADGE: Record<SeasonType, { label: string; icon: string; bg: string; stroke: string; text: string }> = {
  four_seasons: { label: "Four Seasons", icon: "◑", bg: "#1A1206", stroke: "#332810", text: "#CC9944" },
  mild_seasons: { label: "Mild", icon: "◑", bg: "#0E1A2A", stroke: "#103050", text: "#5599CC" },
  tropical: { label: "Tropical", icon: "◑", bg: "#0D1A10", stroke: "#1A3A20", text: "#44CC66" },
  arid: { label: "Arid", icon: "◑", bg: "#1A1200", stroke: "#332200", text: "#AA7733" },
  polar: { label: "Polar", icon: "◑", bg: "#1A1A1A", stroke: "#333333", text: "#999999" },
};
