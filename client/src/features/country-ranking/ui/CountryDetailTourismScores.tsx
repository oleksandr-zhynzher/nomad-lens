import type { CountryData } from "@core/models";
import { CATEGORY_LABELS, TOURISM_GROUPS } from "@core/models";
import { tourismScoreColourClass } from "@core/utils";
import { TOURISM_COLORS } from "@features/tourism/constants";
import { computeTourismScore } from "@features/tourism/utils";
import { useTranslation } from "react-i18next";

interface CountryDetailTourismScoresProps {
  readonly c: CountryData;
}

export function CountryDetailTourismScores({ c }: CountryDetailTourismScoresProps) {
  const { t } = useTranslation();
  const tourismScore = computeTourismScore(c);
  const tourismGroupRows = TOURISM_GROUPS.flatMap((group) => {
    const metrics = group.keys.flatMap((key) => {
      const value = c.scores[key].value;
      if (value == null) return [];
      return [
        {
          key,
          label: t(`tourism.metrics.${key}`, CATEGORY_LABELS[key]),
          value,
          color: TOURISM_COLORS[key] ?? "#888",
        },
      ];
    });
    return metrics.length > 0 ? [{ labelKey: group.labelKey, metrics }] : [];
  });

  if (tourismScore == null) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-[11px] font-semibold tracking-[1.5px] text-[#6B9E6B] uppercase">
        {t("countryDetail.tourismScores", "Tourism Score")}
        <span
          className={`ml-2 font-mono text-[13px] font-bold ${tourismScoreColourClass(tourismScore, "text")}`}
        >
          {tourismScore.toFixed(1)}
        </span>
      </h3>
      <div className="flex flex-col gap-3">
        {tourismGroupRows.map((group) => (
          <div key={group.labelKey}>
            <div className="mb-1.5 text-[9px] font-semibold tracking-[1px] text-[#666] uppercase">
              {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
            </div>
            <div className="flex flex-col gap-1.5">
              {group.metrics.map((metric) => (
                <div key={metric.key} className="flex h-[22px] items-center gap-2">
                  <span className="w-[130px] shrink-0 text-[11px] text-muted">{metric.label}</span>
                  <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-surface-4">
                    <div
                      className="h-full w-[var(--bw)] rounded-[3px] bg-[var(--bc)]"
                      style={
                        {
                          "--bw": `${metric.value}%`,
                          "--bc": metric.color,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <span className="w-[28px] shrink-0 text-right font-mono text-[11px] font-semibold text-on-surface">
                    {metric.value.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
