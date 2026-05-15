import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { VISIBLE_CATEGORY_KEYS, TOURISM_GROUPS, CATEGORY_LABELS } from "@core/models";
import { useLocalizedCountry } from "@core/utils";
import { tourismScoreColourClass } from "@core/utils";
import { ScoreBreakdown } from "@core/ui/indicator";
import { computeTourismScore } from "@features/tourism/utils";
import { TOURISM_COLORS } from "@features/tourism/constants";

interface CountryPerformanceSectionProps {
  readonly country: CountryData;
}

export function CountryPerformanceSection({ country }: CountryPerformanceSectionProps) {
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
  const tourismTags = [...new Set(country.tourismTags)].sort(
    (left, right) =>
      (country.tourismTagScores?.[right] ?? 0) - (country.tourismTagScores?.[left] ?? 0),
  );

  return (
    <>
      {/* Performance header + ScoreBreakdown */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
          {t("countryPage.performanceBreakdown")}
        </h2>
        <span className="flex-1 text-right text-xs text-dimmer">
          {t("countryPage.categoriesSubtitle", {
            count: VISIBLE_CATEGORY_KEYS.length,
            name: locC.name,
          })}
        </span>
      </div>

      <ScoreBreakdown country={country} columns={4} />

      {/* Tourism metrics */}
      {tourismMetricCount > 0 ? (
        <>
          <div className="h-px bg-[#1E1E1E]" />
          <div className="flex flex-col gap-6 bg-bg py-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
                {t("nav.tourism", "Tourism")}
              </h2>
              <span className="flex-1 text-right text-xs text-dimmer">
                {t("indicatorsPage.tourismIndicatorsLabel", {
                  count: tourismMetricCount,
                })}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
                    {t("countryDetail.tourismScores", "Tourism Score")}
                  </span>
                  <span className="font-mono text-xs text-[#666666]">{tourismMetricCount}</span>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`font-display text-[42px] leading-none font-bold ${tourismScore == null ? "text-dimmer" : tourismScoreColourClass(tourismScore, "text")}`}
                  >
                    {tourismScore == null ? "—" : tourismScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-dim">
                    {t("tourismWeights.metricsLabel", "Tourism Metrics")}
                  </span>
                </div>

                <p className="m-0 text-xs leading-relaxed text-dim">
                  {tourismScore == null
                    ? t(
                        "countryPage.tourismProfileUnavailable",
                        "Tourism indicators are not available for this country yet.",
                      )
                    : t(
                        "countryPage.tourismProfileSubtitle",
                        "{{name}}'s tourism profile across safety, sightseeing, and activities.",
                        { name: locC.name },
                      )}
                </p>

                {tourismTags.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
                      {t("tourismFilters.activityTags", "Activities")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tourismTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#252525] bg-[#1A1A1C] px-2.5 py-1.5 text-[11px] font-semibold text-[#CFCFCF]"
                        >
                          {t(`tourismTags.${tag}`, tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

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
      ) : null}
    </>
  );
}
