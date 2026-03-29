import { useState } from "react";
import type { RankedCountry } from "../utils/types";
import {
  CATEGORY_ABBREVS,
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Tooltip } from "./Tooltip";

interface CountryCardProps {
  ranked: RankedCountry;
  highlighted?: boolean;
}

export function CountryCard({ ranked, highlighted = false }: CountryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { country, finalScore, rank } = ranked;

  return (
    <div
      data-country-code={country.code}
      className={`bg-slate-800 border rounded-xl overflow-hidden transition-all duration-700 ${
        highlighted ? "border-sky-400 ring-2 ring-sky-400" : "border-slate-700"
      }`}
    >
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-750 transition-colors text-left"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <span className="w-7 text-center shrink-0 font-mono text-sm text-slate-500">
          {rank}
        </span>

        {/* Flag */}
        <img
          src={country.flagUrl}
          alt={`${country.name} flag`}
          className="w-8 h-5 object-cover rounded shrink-0"
          loading="lazy"
        />

        {/* Name + region */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-100 truncate">{country.name}</p>
          <p className="text-xs text-slate-500">{country.region}</p>
        </div>

        {/* Mini category dots */}
        <div className="hidden sm:flex gap-1 items-end" onClick={(e) => e.stopPropagation()}>
          {CATEGORY_KEYS.map((key) => {
            const val = country.scores[key]?.value ?? null;
            return (
              <Tooltip
                key={key}
                side="bottom"
                content={
                  <>
                    <p className="font-medium text-slate-100 mb-0.5">{CATEGORY_LABELS[key]}</p>
                    <p className={`text-base font-bold mb-1.5 ${scoreColour(val)}`}>
                      {val !== null ? val.toFixed(0) : "N/A"}
                      <span className="text-xs font-normal text-slate-500"> / 100</span>
                    </p>
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
  if (value === null) return "bg-slate-600";
  if (value >= 75) return "bg-green-400";
  if (value >= 50) return "bg-yellow-400";
  if (value >= 25) return "bg-orange-400";
  return "bg-red-400";
}
