import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { VISIBLE_CATEGORY_KEYS, CATEGORY_LABELS } from "@core/models";
import { scoreColourClass } from "@core/utils";

interface ScoreBreakdownProps {
  country: CountryData;
  columns?: 3 | 4;
}

export function ScoreBreakdown({ country, columns = 3 }: ScoreBreakdownProps) {
  const { t } = useTranslation();
  const gridClassName =
    columns === 4
      ? "grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3"
      : "grid grid-cols-3 gap-2 md:gap-3";

  return (
    <div className={gridClassName}>
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
            .map(([, ind]) => `${ind!.raw.toLocaleString()}${ind!.unit} (${ind!.year})`)
            .join(" · ");
        }

        return (
          <div key={key} className="flex flex-col gap-1 rounded bg-surface-2 p-2 md:p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary">
                {t(`indicatorsPage.indicators.${key}.name`, CATEGORY_LABELS[key])}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${scoreColourClass(value, "text")}`}
              >
                {value === null ? "N/A" : value.toFixed(0)}
              </span>
            </div>

            {/* Score bar - 4px height */}
            <div className="h-1 rounded-full bg-border">
              <div
                className={`h-1 rounded-full transition-all ${scoreColourClass(value, "bg")} w-[var(--w)]`}
                style={{ "--w": `${value ?? 0}%` } as React.CSSProperties}
              />
            </div>

            {/* Detail text */}
            {detailText ? (
              <p className="mt-0.5 font-mono text-[10px] text-dim">{detailText}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
