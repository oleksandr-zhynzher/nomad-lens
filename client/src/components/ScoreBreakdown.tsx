import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { CountryData } from "../utils/types";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { Tooltip } from "./Tooltip";

interface ScoreBreakdownProps {
  country: CountryData;
}

export function ScoreBreakdown({ country }: ScoreBreakdownProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CATEGORY_KEYS.map((key) => {
        const category = country.scores[key];
        const value = category?.value ?? null;

        return (
          <div key={key} className="bg-slate-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-400">
                  {CATEGORY_LABELS[key]}
                </span>
                <Tooltip
                  side="bottom"
                  content={
                    <>
                      <p className="font-medium text-slate-100 mb-1">{CATEGORY_LABELS[key]}</p>
                      <p className="text-slate-400 mb-2">{CATEGORY_DESCRIPTIONS[key]}</p>
                      <p className="text-slate-500 border-t border-slate-700 pt-1.5">
                        <span className="text-slate-600">Source: </span>{CATEGORY_DATA_SOURCES[key]}
                      </p>
                    </>
                  }
                >
                  <InformationCircleIcon className="w-3 h-3 text-slate-700 hover:text-slate-500 transition-colors cursor-default" />
                </Tooltip>
              </div>
              <span className={`text-sm font-bold ${scoreColour(value)}`}>
                {value !== null ? value.toFixed(0) : "N/A"}
              </span>
            </div>

            {/* Score bar */}
            <div className="h-1 bg-slate-700 rounded-full mb-3">
              <div
                className={`h-1 rounded-full transition-all ${barColour(value)}`}
                style={{ width: `${value ?? 0}%` }}
              />
            </div>

            {/* Raw indicators */}
            {category?.indicators &&
              Object.entries(category.indicators).map(([indKey, ind]) => (
                <div key={indKey} className="flex justify-between text-xs py-0.5">
                  <span className="text-slate-500 truncate mr-2">{formatKey(indKey)}</span>
                  <span className="text-slate-300 font-mono shrink-0">
                    {ind.raw.toLocaleString()} {ind.unit}{" "}
                    <span className="text-slate-600">({ind.year})</span>
                  </span>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

function barColour(value: number | null): string {
  if (value === null) return "bg-slate-600";
  if (value >= 75) return "bg-green-400";
  if (value >= 50) return "bg-yellow-400";
  if (value >= 25) return "bg-orange-400";
  return "bg-red-400";
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
