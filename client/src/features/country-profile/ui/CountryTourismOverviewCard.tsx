import { tourismScoreColourClass } from "@core/utils";
import { useTranslation } from "react-i18next";

interface CountryTourismOverviewCardProps {
  readonly tourismScore: number | null;
  readonly tourismMetricCount: number;
  readonly countryName: string;
  readonly tourismTags: readonly string[];
}

export function CountryTourismOverviewCard({
  tourismScore,
  tourismMetricCount,
  countryName,
  tourismTags,
}: CountryTourismOverviewCardProps) {
  const { t } = useTranslation();
  return (
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
              { name: countryName },
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
  );
}
