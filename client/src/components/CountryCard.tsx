import { useState } from "react";
import { ChevronRight, Plane } from "lucide-react";
import type { RankedCountry } from "../utils/types";
import {
  VISIBLE_CATEGORY_KEYS,
} from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Tooltip } from "./Tooltip";
import { CATEGORY_LABELS } from "../utils/types";

interface CountryCardProps {
  ranked: RankedCountry;
  highlighted?: boolean;
  index: number;
}

export function CountryCard({ ranked, highlighted = false, index }: CountryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { country, finalScore, rank } = ranked;
  
  // Alternating backgrounds - lighter for better readability
  const isEven = index % 2 === 0;
  const bgColor = isEven ? "#1A1A1C" : "#161618";
  const hoverBg = isEven ? "#232325" : "#1E1E20";
  const borderColor = isEven ? "#252527" : "#1F1F21";

  return (
    <div
      data-country-code={country.code}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`overflow-hidden transition-all duration-150 ${highlighted ? "ring-2" : ""}`}
      style={{
        backgroundColor: highlighted ? bgColor : hovered ? hoverBg : bgColor,
        borderTop: `1px solid ${highlighted ? "var(--color-accent)" : hovered ? "#3A3A3A" : borderColor}`,
        ...(highlighted && { boxShadow: `0 0 0 2px var(--color-accent)` }),
      }}
    >
      {/* Main row */}
      <button
        className="w-full flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 transition-all text-left cursor-pointer"
        style={{ minHeight: "56px" }}
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <span className="text-base md:text-lg" style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, color: "var(--color-accent)", width: "28px", textAlign: "center", flexShrink: 0 }}>
          {rank}
        </span>

        {/* Flag */}
        <img
          src={country.flagUrl}
          alt={`${country.name} flag`}
          className="object-cover shrink-0"
          style={{ width: "24px", height: "16px", borderRadius: "2px" }}
          loading="lazy"
        />

{/* Name + region + visa icon */}
          <div className="flex-1 min-w-0 flex items-center gap-2 min-w-0">
            <p className="truncate" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#FFFFFF" }}>
              {country.name}
            </p>
            <span className="hidden sm:inline shrink-0" style={{ fontFamily: "Geist, sans-serif", fontSize: "11px", color: "#555555" }}>
              {country.region}
            </span>
            {country.hasNomadVisa && (
              <Tooltip content="Nomad Visa Available" side="top">
                <span className="shrink-0 inline-flex items-center justify-center" style={{ color: "var(--color-accent-dim)", lineHeight: 1 }}>
                  <Plane size={13} />
                </span>
              </Tooltip>
            )}
        </div>

        {/* Sparkline dots */}
        <div className="hidden sm:flex gap-1 items-center">
          {VISIBLE_CATEGORY_KEYS.map((key) => {
            const val = country.scores[key]?.value ?? null;
            const label = CATEGORY_LABELS[key];
            const tooltipContent = (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: "11px", color: "#CCCCCC", fontFamily: "Geist, sans-serif" }}>{label}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "IBM Plex Mono, monospace", color: dotColour(val) }}>
                  {val !== null ? val.toFixed(1) : "—"}
                </span>
              </div>
            );
            return (
              <Tooltip key={key} content={tooltipContent} side="top">
                <div
                  className="rounded-full cursor-default"
                  style={{ width: "12px", height: "12px", backgroundColor: dotColour(val) }}
                />
              </Tooltip>
            );
          })}
        </div>

        {/* Final score */}
        <div className="shrink-0">
          <span className="text-lg md:text-xl" style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, color: scoreColour(finalScore) }}>
            {finalScore.toFixed(1)}
          </span>
        </div>

        {/* Chevron */}
        <ChevronRight size={20} style={{ color: "#333333", transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }} className="shrink-0" />
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

function dotColour(value: number | null): string {
  if (value === null) return "#3A3A3A";
  if (value >= 75) return "#4CAF50";
  if (value >= 60) return "#8BC34A";
  if (value >= 50) return "#FFC107";
  return "#FF5722";
}
