import React from "react";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { CategoryKey, ClimatePreferences, SeasonType, WeightMap } from "../utils/types";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { defaultWeights, weightPercent } from "../utils/scoring";
import { Tooltip } from "./Tooltip";

interface WeightSliderProps {
  categoryKey: CategoryKey;
  value: number;
  onChange: (key: CategoryKey, value: number) => void;
  weights: WeightMap;
}

function WeightSlider({ categoryKey, value, onChange, weights }: WeightSliderProps) {
  const label = CATEGORY_LABELS[categoryKey];
  const description = CATEGORY_DESCRIPTIONS[categoryKey];
  const source = CATEGORY_DATA_SOURCES[categoryKey];
  const pct = weightPercent(categoryKey, weights);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          <Tooltip
            content={
              <>
                <p className="font-medium text-slate-100 mb-1">{label}</p>
                <p className="text-slate-400 mb-2">{description}</p>
                <p className="text-slate-500 border-t border-slate-700 pt-1.5">
                  <span className="text-slate-600">Source: </span>{source}
                </p>
              </>
            }
          >
            <InformationCircleIcon className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors cursor-default" />
          </Tooltip>
        </div>
        <span className="text-xs font-mono text-sky-400 w-10 text-right">{pct}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(categoryKey, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-sky-400 cursor-pointer"
        aria-label={`${label} weight`}
      />
    </div>
  );
}

interface WeightPanelProps {
  weights: WeightMap;
  onChange: (key: CategoryKey, value: number) => void;
  onReset: () => void;
  climatePrefs: ClimatePreferences;
  onClimatePrefsChange: (prefs: ClimatePreferences) => void;
}

const SEASON_OPTIONS: Array<{ value: SeasonType | 'any'; label: string }> = [
  { value: 'any', label: 'Any' },
  { value: 'four_seasons', label: '\uD83C\uDF42 Four Seasons' },
  { value: 'mild_seasons', label: '\uD83C\uDF0A Mild' },
  { value: 'tropical', label: '\uD83C\uDF34 Tropical' },
  { value: 'arid', label: '\uD83C\uDFDC Arid' },
  { value: 'polar', label: '\u2744\uFE0F Polar' },
];

export function WeightPanel({ weights, onChange, onReset, climatePrefs, onClimatePrefsChange }: WeightPanelProps) {
  return (
    <aside className="flex flex-col bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden sticky top-14 h-[calc(100vh-3.5rem-1.5rem)]">
      {/* Fixed header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">Score Weights</h2>
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Drag sliders to prioritize what matters to you. Rankings update instantly.
        </p>
      </div>

      {/* Scrollable sliders */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="flex flex-col gap-4 py-1">
          {CATEGORY_KEYS.map((key) => (
            <React.Fragment key={key}>
              <WeightSlider
                categoryKey={key}
                value={weights[key]}
                onChange={onChange}
                weights={weights}
              />
              {key === 'climate' && (
                <div className="flex flex-col gap-3 pl-1 border-l-2 border-slate-700">
                  {/* Season type pills */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">Season type</p>
                    <div className="flex flex-wrap gap-1">
                      {SEASON_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onClimatePrefsChange({ ...climatePrefs, seasonType: opt.value })}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                            climatePrefs.seasonType === opt.value
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Temperature range */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500">Preferred temp range</p>
                      <span className="text-xs font-mono text-sky-400">
                        {climatePrefs.minTemp}° – {climatePrefs.maxTemp}°C
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-6">Min</span>
                        <input
                          type="range"
                          min={-10}
                          max={45}
                          value={climatePrefs.minTemp}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            onClimatePrefsChange({ ...climatePrefs, minTemp: Math.min(v, climatePrefs.maxTemp - 1) });
                          }}
                          className="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 accent-sky-400 cursor-pointer"
                          aria-label="Minimum preferred temperature"
                        />
                        <span className="text-xs font-mono text-slate-400 w-8 text-right">{climatePrefs.minTemp}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-6">Max</span>
                        <input
                          type="range"
                          min={-10}
                          max={45}
                          value={climatePrefs.maxTemp}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            onClimatePrefsChange({ ...climatePrefs, maxTemp: Math.max(v, climatePrefs.minTemp + 1) });
                          }}
                          className="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 accent-sky-400 cursor-pointer"
                          aria-label="Maximum preferred temperature"
                        />
                        <span className="text-xs font-mono text-slate-400 w-8 text-right">{climatePrefs.maxTemp}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Percentages shown are relative shares of all active weights.
        </p>
      </div>
    </aside>
  );
}

export { defaultWeights };

