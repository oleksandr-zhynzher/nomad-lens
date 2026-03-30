import React from "react";
import type { CategoryKey, ClimatePreferences, SeasonType, WeightMap } from "../utils/types";
import {
  CATEGORY_DATA_SOURCES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
} from "../utils/types";
import { defaultWeights, weightPercent } from "../utils/scoring";

interface WeightSliderProps {
  categoryKey: CategoryKey;
  value: number;
  onChange: (key: CategoryKey, value: number) => void;
  weights: WeightMap;
}

function WeightSlider({ categoryKey, value, onChange, weights }: WeightSliderProps) {
  const label = CATEGORY_LABELS[categoryKey];
  const pct = weightPercent(categoryKey, weights);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 400, color: "#FFFFFF" }}>
          {label}
        </span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "11px", color: "var(--color-accent-dim)" }}>
          {pct}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(categoryKey, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${value}%, #333333 ${value}%, #333333 100%)`
        }}
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
  { value: 'four_seasons', label: 'Four Seasons' },
  { value: 'mild_seasons', label: 'Mild' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'arid', label: 'Arid' },
  { value: 'polar', label: 'Polar' },
];

export function WeightPanel({ weights, onChange, onReset, climatePrefs, onClimatePrefsChange }: WeightPanelProps) {
  return (
    <aside className="flex flex-col overflow-hidden sticky h-[calc(100vh-3.5rem-1.5rem)]" style={{ backgroundColor: "var(--color-surface)", top: "72px", width: "320px", borderRadius: "0" }}>
      {/* Fixed header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3" style={{ borderBottom: "1px solid #333333" }}>
        <h2 style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#FFFFFF" }}>
          WEIGHTS & PREFERENCES
        </h2>
      </div>

      {/* Scrollable sliders */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="flex flex-col gap-4 py-4">
          {CATEGORY_KEYS.map((key) => (
            <React.Fragment key={key}>
              <WeightSlider
                categoryKey={key}
                value={weights[key]}
                onChange={onChange}
                weights={weights}
              />
              {key === 'climate' && (
                <div className="flex flex-col gap-3 p-3 rounded" style={{ backgroundColor: "var(--color-surface-3)" }}>
                  <div style={{ fontFamily: "Geist, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#888888" }}>
                    CLIMATE PREFERENCES
                  </div>
                  
                  {/* Season type pills - 2 rows */}
                  <div>
                    <p style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#999999", marginBottom: "6px" }}>Season type</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {SEASON_OPTIONS.slice(0, 4).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => onClimatePrefsChange({ ...climatePrefs, seasonType: opt.value })}
                            className="text-xs px-2.5 py-1 rounded-full transition-colors"
                            style={{
                              fontFamily: "Geist, sans-serif",
                              fontSize: "10px",
                              backgroundColor: climatePrefs.seasonType === opt.value ? "var(--color-accent)" : "#2A2A2A",
                              color: climatePrefs.seasonType === opt.value ? "#FFFFFF" : "#666666",
                              border: "none"
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {SEASON_OPTIONS.slice(4).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => onClimatePrefsChange({ ...climatePrefs, seasonType: opt.value })}
                            className="text-xs px-2.5 py-1 rounded-full transition-colors"
                            style={{
                              fontFamily: "Geist, sans-serif",
                              fontSize: "10px",
                              backgroundColor: climatePrefs.seasonType === opt.value ? "var(--color-accent)" : "#2A2A2A",
                              color: climatePrefs.seasonType === opt.value ? "#FFFFFF" : "#666666",
                              border: "none"
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Temperature range */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#999999" }}>Temperature Range</p>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "11px", color: "var(--color-accent-dim)" }}>
                        {climatePrefs.minTemp}° – {climatePrefs.maxTemp}°C
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#999999", width: "32px" }}>Min</span>
                        <input
                          type="range"
                          min={-10}
                          max={45}
                          value={climatePrefs.minTemp}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            onClimatePrefsChange({ ...climatePrefs, minTemp: Math.min(v, climatePrefs.maxTemp - 1) });
                          }}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((climatePrefs.minTemp + 10) / 55) * 100}%, #333333 ${((climatePrefs.minTemp + 10) / 55) * 100}%, #333333 100%)`
                          }}
                          aria-label="Minimum preferred temperature"
                        />
                        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "10px", color: "#999999", width: "32px", textAlign: "right" }}>{climatePrefs.minTemp}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#999999", width: "32px" }}>Max</span>
                        <input
                          type="range"
                          min={-10}
                          max={45}
                          value={climatePrefs.maxTemp}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            onClimatePrefsChange({ ...climatePrefs, maxTemp: Math.max(v, climatePrefs.minTemp + 1) });
                          }}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((climatePrefs.maxTemp + 10) / 55) * 100}%, #333333 ${((climatePrefs.maxTemp + 10) / 55) * 100}%, #333333 100%)`
                          }}
                          aria-label="Maximum preferred temperature"
                        />
                        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "10px", color: "#999999", width: "32px", textAlign: "right" }}>{climatePrefs.maxTemp}°</span>
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
      <div className="flex-shrink-0 px-5 py-3 flex flex-col gap-2" style={{ borderTop: "1px solid #333333" }}>
        <button
          onClick={onReset}
          className="w-full py-2 rounded transition-colors"
          style={{ backgroundColor: "#222222", color: "#999999", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}
        >
          Reset Weights
        </button>
        <p style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#555555", lineHeight: "1.4" }}>
          Percentages shown are relative shares of all active weights.
        </p>
      </div>
    </aside>
  );
}

export { defaultWeights };

