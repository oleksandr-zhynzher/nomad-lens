import React from "react";
import { Info } from "lucide-react";
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
  const pct = weightPercent(categoryKey, weights);
  const description = CATEGORY_DESCRIPTIONS[categoryKey];
  const dataSource = CATEGORY_DATA_SOURCES[categoryKey];

  return (
    <div className="flex flex-col" style={{ gap: "5px" }}>
      <div className="flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 400, color: "#FFFFFF" }}>
            {label}
          </span>
          <Tooltip
            content={
              <div>
                <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>{label}</div>
                <div style={{ marginBottom: "8px" }}>{description}</div>
                <div style={{ fontSize: "10px", color: "#888888" }}>Source: {dataSource}</div>
              </div>
            }
            side="top"
          >
            <Info size={14} color="#FFFFFF" style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }} />
          </Tooltip>
        </div>
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
  nomadVisaOnly: boolean;
  onNomadVisaOnlyChange: (value: boolean) => void;
}

const SEASON_OPTIONS: Array<{ value: SeasonType | 'any'; label: string }> = [
  { value: 'any', label: 'Any' },
  { value: 'four_seasons', label: 'Four Seasons' },
  { value: 'mild_seasons', label: 'Mild' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'arid', label: 'Arid' },
  { value: 'polar', label: 'Polar' },
];

export function WeightPanel({ weights, onChange, onReset, climatePrefs, onClimatePrefsChange, nomadVisaOnly, onNomadVisaOnlyChange }: WeightPanelProps) {
  return (
    <aside className="flex flex-col overflow-hidden" style={{ backgroundColor: "#1A1A1A", width: "320px", height: "100vh" }}>
      {/* Fixed header */}
      <div className="flex-shrink-0" style={{ padding: "14px 16px", borderBottom: "1px solid #333333" }}>
        <h2 style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#FFFFFF" }}>
          WEIGHTS & PREFERENCES
        </h2>
      </div>

      {/* Scrollable sliders */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {CATEGORY_KEYS.map((key) => (
            <React.Fragment key={key}>
              <div style={{ padding: "8px 16px" }}>
                <WeightSlider
                categoryKey={key}
                value={weights[key]}
                onChange={onChange}
                weights={weights}
              />
              </div>
              {key === 'englishProficiency' && (
                <div className="flex items-center justify-between" style={{ padding: "8px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 400, color: "#FFFFFF" }}>
                      Nomad Visa Only
                    </span>
                    <Tooltip
                      content={
                        <div>
                          <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>Nomad Visa Filter</div>
                          <div>When enabled, only shows countries that offer digital nomad visas or long-term remote work permits, making it easier to legally stay and work remotely for extended periods.</div>
                        </div>
                      }
                      side="top"
                    >
                      <Info size={14} color="#FFFFFF" style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }} />
                    </Tooltip>
                  </div>
                  <button
                    onClick={() => onNomadVisaOnlyChange(!nomadVisaOnly)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: nomadVisaOnly ? "var(--color-accent)" : "#333333" }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      style={{ transform: nomadVisaOnly ? "translateX(26px)" : "translateX(4px)" }}
                    />
                  </button>
                </div>
              )}
              {key === 'climate' && (
                <div className="flex flex-col gap-3" style={{ backgroundColor: "#141414", padding: "14px 20px 16px 20px" }}>
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
      <div className="flex-shrink-0" style={{ borderTop: "1px solid #333333", backgroundColor: "#1A1A1A" }}>
        <div className="flex flex-col gap-2" style={{ padding: "12px 16px" }}>
          <button
            onClick={onReset}
            className="w-full rounded transition-colors"
            style={{ 
              backgroundColor: "#222222", 
              color: "#999999", 
              fontFamily: "Inter, sans-serif", 
              fontSize: "13px", 
              fontWeight: 500,
              height: "36px",
              border: "1px solid #3A3A3A"
            }}
          >
            Reset Weights
          </button>
          <p style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", color: "#555555", lineHeight: "1.4" }}>
            Percentages shown are relative shares of all active weights.
          </p>
        </div>
      </div>
    </aside>
  );
}

export { defaultWeights };

