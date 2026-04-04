import { useTranslation } from "react-i18next";
import type { CountryData } from "../utils/types";
import { VISIBLE_CATEGORY_KEYS, CATEGORY_LABELS } from "../utils/types";
import { scoreColour } from "../utils/scoring";

interface ScoreBreakdownProps {
  country: CountryData;
}

export function ScoreBreakdown({ country }: ScoreBreakdownProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      {VISIBLE_CATEGORY_KEYS.map((key) => {
        const category = country.scores[key];
        const value = category?.value ?? null;

        // Build detail text from indicators
        let detailText = "";
        if (category?.indicators) {
          const indEntries = Object.entries(category.indicators)
            .filter(([, ind]) => ind !== undefined)
            .slice(0, 2); // First 2 indicators
          detailText = indEntries
            .map(
              ([, ind]) =>
                `${ind!.raw.toLocaleString()}${ind!.unit} (${ind!.year})`,
            )
            .join(" · ");
        }

        return (
          <div
            key={key}
            className="flex flex-col gap-1 p-3 rounded"
            style={{ backgroundColor: "#222222" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#CCCCCC",
                }}
              >
                {t(
                  `indicatorsPage.indicators.${key}.name`,
                  CATEGORY_LABELS[key],
                )}
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: scoreColour(value),
                }}
              >
                {value !== null ? value.toFixed(0) : "N/A"}
              </span>
            </div>

            {/* Score bar - 4px height */}
            <div
              className="rounded-full"
              style={{ height: "4px", backgroundColor: "#333333" }}
            >
              <div
                className="rounded-full transition-all"
                style={{
                  height: "4px",
                  width: `${value ?? 0}%`,
                  backgroundColor: barColour(value),
                }}
              />
            </div>

            {/* Detail text */}
            {detailText && (
              <p
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "10px",
                  color: "#666666",
                  marginTop: "2px",
                }}
              >
                {detailText}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function barColour(value: number | null): string {
  if (value === null) return "#3A3A3A";
  if (value >= 75) return "#4CAF50";
  if (value >= 60) return "#8BC34A";
  if (value >= 50) return "#FFC107";
  return "#FF5722";
}
