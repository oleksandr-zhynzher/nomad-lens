import type { CountryData } from "@core/models";
import { CATEGORY_LABELS, TOURISM_GROUPS } from "@core/models";
import { useLocalizedCountry } from "@core/utils";
import { TOURISM_COLORS } from "@features/tourism/constants";
import { computeTourismScore } from "@features/tourism/utils";
import type React from "react";
import { useTranslation } from "react-i18next";

import { CountryTourismOverviewCard } from "./CountryTourismOverviewCard";

interface CountryTourismSectionProps {
  readonly country: CountryData;
}

export function CountryTourismSection({ country }: CountryTourismSectionProps) {
  const { t } = useTranslation();
  const locC = useLocalizedCountry(country);
  const tourismScore = computeTourismScore(country);
  const tourismGroups = TOURISM_GROUPS.map((group) => ({
    labelKey: group.labelKey,
    metrics: group.keys
      .map((key) => ({ key, value: country.scores[key].value }))
      .filter(
        (metric): metric is { key: (typeof group.keys)[number]; value: number } =>
          metric.value != null,
      ),
  })).filter((group) => group.metrics.length > 0);
  const tourismMetricCount = tourismGroups.reduce(
    (count, group) => count + group.metrics.length,
    0,
  );
  const tourismTags = [...new Set(country.tourismTags)].toSorted(
    (l, r) => (country.tourismTagScores?.[r] ?? 0) - (country.tourismTagScores?.[l] ?? 0),
  );

  if (tourismMetricCount === 0) return null;

  return (
    <>
      <div className="h-px bg-[#1E1E1E]" />
      <div className="flex flex-col gap-6 bg-bg py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <h2 className="m-0 font-display font-semibold text-[#E8E9EB]">
            {t("nav.tourism", "Tourism")}
          </h2>
          <span className="flex-1 text-right text-xs text-dimmer">
            {t("indicatorsPage.tourismIndicatorsLabel", { count: tourismMetricCount })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CountryTourismOverviewCard
            tourismScore={tourismScore}
            tourismMetricCount={tourismMetricCount}
            countryName={locC.name}
            tourismTags={tourismTags}
          />

          {tourismGroups.map((group) => (
            <div
              key={group.labelKey}
              className="flex flex-col gap-[14px] rounded-xl border border-[#1E1E1E] bg-[#111111] p-6"
            >
              <div className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
                {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
              </div>
              <div className="flex flex-col gap-3">
                {group.metrics.map((metric) => (
                  <div key={metric.key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#CFCFCF]">
                        {t(`tourism.metrics.${metric.key}`, CATEGORY_LABELS[metric.key])}
                      </span>
                      <span className="shrink-0 font-mono text-xs font-bold text-[#E8E9EB]">
                        {metric.value.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#232323]">
                      <div
                        style={
                          {
                            "--w": `${metric.value}%`,
                            "--c": TOURISM_COLORS[metric.key] ?? "#8F5A3C",
                          } as React.CSSProperties
                        }
                        className="h-full w-[var(--w)] rounded-full bg-[var(--c)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
