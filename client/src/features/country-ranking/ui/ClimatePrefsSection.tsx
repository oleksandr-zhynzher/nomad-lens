import type { ClimatePreferences } from "@core/models";
import { SEASON_ROW1, SEASON_ROW2 } from "@features/country-ranking/constants";
import type React from "react";
import { useTranslation } from "react-i18next";

interface ClimatePrefsProps {
  readonly climatePrefs: ClimatePreferences;
  readonly onClimatePrefsChange: (prefs: ClimatePreferences) => void;
}

export function ClimatePrefsSection({ climatePrefs, onClimatePrefsChange }: ClimatePrefsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 bg-surface-3 px-5 py-[10px]">
      {/* Season rows — 3 equal-width buttons per row */}
      {([SEASON_ROW1, SEASON_ROW2] as const).map((row, ri) => (
        <div key={ri === 0 ? "row-1" : "row-2"} className="flex gap-1">
          {row.map((opt) => {
            const active = climatePrefs.seasonType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onClimatePrefsChange({ ...climatePrefs, seasonType: opt.value });
                }}
                className={`flex-1 cursor-pointer rounded-[3px] border-0 py-[5px] text-center text-[10px] font-normal ${active ? "bg-accent text-white" : "bg-surface-4 text-dim"}`}
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
          {climatePrefs.minTemp}°C to {climatePrefs.maxTemp}°C
        </span>
      </div>
      {/* Min/Max sliders */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 text-xs text-dimmer">{t("climate.min")}</span>
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
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
            style={
              { "--pct": `${((climatePrefs.minTemp + 10) / 55) * 100}%` } as React.CSSProperties
            }
            aria-label={t("a11y.minimumPreferredTemperature", "Minimum preferred temperature")}
          />
          <span className="w-9 text-right font-mono text-xs text-muted">
            {climatePrefs.minTemp}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-xs text-dimmer">{t("climate.max")}</span>
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
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
            style={
              { "--pct": `${((climatePrefs.maxTemp + 10) / 55) * 100}%` } as React.CSSProperties
            }
            aria-label={t("a11y.maximumPreferredTemperature", "Maximum preferred temperature")}
          />
          <span className="w-9 text-right font-mono text-xs text-muted">
            {climatePrefs.maxTemp}°
          </span>
        </div>
      </div>
    </div>
  );
}
