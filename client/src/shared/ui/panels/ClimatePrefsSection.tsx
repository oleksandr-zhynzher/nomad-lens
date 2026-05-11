import React from "react";
import { useTranslation } from "react-i18next";
import type { ClimatePreferences } from "../../../utils/types";
import { SEASON_ROW1, SEASON_ROW2 } from "../../../utils/weightConfig";

interface ClimatePrefsProps {
  climatePrefs: ClimatePreferences;
  onClimatePrefsChange: (prefs: ClimatePreferences) => void;
}

export function ClimatePrefsSection({ climatePrefs, onClimatePrefsChange }: ClimatePrefsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col bg-surface-3 px-5 py-[10px] gap-2">
      {/* Season rows — 3 equal-width buttons per row */}
      {[SEASON_ROW1, SEASON_ROW2].map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((opt) => {
            const active = climatePrefs.seasonType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onClimatePrefsChange({ ...climatePrefs, seasonType: opt.value })}
                className={`flex-1 py-[5px] rounded-[3px] border-0 cursor-pointer text-[10px] font-normal text-center ${active ? "bg-accent text-white" : "bg-surface-4 text-dim"}`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      ))}
      {/* Temperature header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{t("climate.temperatureRange")}</span>
        <span className="font-mono text-xs text-accent-dim">
          {climatePrefs.minTemp}°C — {climatePrefs.maxTemp}°C
        </span>
      </div>
      {/* Min/Max sliders */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-dimmer w-8">{t("climate.min")}</span>
          <input
            name="climate-min-temperature"
            type="range"
            min={-10}
            max={45}
            value={climatePrefs.minTemp}
            onChange={(e) => {
              const v = Number(e.target.value);
              onClimatePrefsChange({
                ...climatePrefs,
                minTemp: Math.min(v, climatePrefs.maxTemp - 1),
              });
            }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
            style={
              { "--pct": `${((climatePrefs.minTemp + 10) / 55) * 100}%` } as React.CSSProperties
            }
            aria-label={t("a11y.minimumPreferredTemperature", "Minimum preferred temperature")}
          />
          <span className="font-mono text-xs text-muted w-9 text-right">
            {climatePrefs.minTemp}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dimmer w-8">{t("climate.max")}</span>
          <input
            name="climate-max-temperature"
            type="range"
            min={-10}
            max={45}
            value={climatePrefs.maxTemp}
            onChange={(e) => {
              const v = Number(e.target.value);
              onClimatePrefsChange({
                ...climatePrefs,
                maxTemp: Math.max(v, climatePrefs.minTemp + 1),
              });
            }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
            style={
              { "--pct": `${((climatePrefs.maxTemp + 10) / 55) * 100}%` } as React.CSSProperties
            }
            aria-label={t("a11y.maximumPreferredTemperature", "Maximum preferred temperature")}
          />
          <span className="font-mono text-xs text-muted w-9 text-right">
            {climatePrefs.maxTemp}°
          </span>
        </div>
      </div>
    </div>
  );
}
