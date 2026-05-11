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
    <div
      className="flex flex-col"
      style={{ backgroundColor: "#141414", padding: "10px 20px", gap: "8px" }}
    >
      {/* Season rows — 3 equal-width buttons per row */}
      {[SEASON_ROW1, SEASON_ROW2].map((row, ri) => (
        <div key={ri} className="flex" style={{ gap: "4px" }}>
          {row.map((opt) => {
            const active = climatePrefs.seasonType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onClimatePrefsChange({ ...climatePrefs, seasonType: opt.value })}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  borderRadius: "3px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: "normal",
                  backgroundColor: active ? "#8F5A3C" : "#2A2A2A",
                  color: active ? "#FFFFFF" : "#8A8A8A",
                  textAlign: "center",
                }}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      ))}
      {/* Temperature header */}
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8A8A8A" }}>
          {t("climate.temperatureRange")}
        </span>
        <span
          style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "12px", color: "#C2956A" }}
        >
          {climatePrefs.minTemp}°C — {climatePrefs.maxTemp}°C
        </span>
      </div>
      {/* Min/Max sliders */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#808080",
              width: "32px",
            }}
          >
            {t("climate.min")}
          </span>
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
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((climatePrefs.minTemp + 10) / 55) * 100}%, #333333 ${((climatePrefs.minTemp + 10) / 55) * 100}%, #333333 100%)`,
            }}
            aria-label={t("a11y.minimumPreferredTemperature", "Minimum preferred temperature")}
          />
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
              color: "#9E9E9E",
              width: "36px",
              textAlign: "right",
            }}
          >
            {climatePrefs.minTemp}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#808080",
              width: "32px",
            }}
          >
            {t("climate.max")}
          </span>
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
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((climatePrefs.maxTemp + 10) / 55) * 100}%, #333333 ${((climatePrefs.maxTemp + 10) / 55) * 100}%, #333333 100%)`,
            }}
            aria-label={t("a11y.maximumPreferredTemperature", "Maximum preferred temperature")}
          />
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
              color: "#9E9E9E",
              width: "36px",
              textAlign: "right",
            }}
          >
            {climatePrefs.maxTemp}°
          </span>
        </div>
      </div>
    </div>
  );
}
