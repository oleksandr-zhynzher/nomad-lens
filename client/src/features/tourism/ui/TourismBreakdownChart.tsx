import { useTranslation } from "react-i18next";
import { TOURISM_CATEGORY_KEYS, type CountryData } from "@core/models";
import { scoreColourClass } from "@core/utils";

interface Props {
  country: CountryData;
}

export function TourismBreakdownChart({ country }: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {TOURISM_CATEGORY_KEYS.map((key) => {
        const category = country.scores[key];
        const value = category?.value ?? null;

        let detailText = "";
        if (category?.indicators) {
          const indEntries = Object.entries(category.indicators)
            .filter(([, ind]) => ind !== undefined)
            .slice(0, 2);
          detailText = indEntries
            .map(([, ind]) => `${ind!.raw.toLocaleString()}${ind!.unit} (${ind!.year})`)
            .join(" · ");
        }

        return (
          <div key={key} className="flex flex-col gap-1 p-2 md:p-3 rounded bg-surface-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tertiary">
                {t(`tourism.metrics.${key}`, key)}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${value !== null ? scoreColourClass(value, "text") : "text-border"}`}
              >
                {value !== null ? value.toFixed(0) : "N/A"}
              </span>
            </div>

            {/* Score bar - 4px height */}
            <div className="rounded-full h-1 bg-border">
              <div
                className={`rounded-full transition-all h-1 ${value !== null ? scoreColourClass(value, "bg") : "bg-border"} w-[var(--w)]`}
                style={{ "--w": `${value ?? 0}%` } as React.CSSProperties}
              />
            </div>

            {/* Detail text */}
            {detailText && <p className="font-mono text-[10px] text-dim mt-0.5">{detailText}</p>}
          </div>
        );
      })}
    </div>
  );
}
