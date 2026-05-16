import type { CountryData } from "@core/models";
import { TOURISM_CATEGORY_KEYS } from "@core/models";
import { ScoreDot, ScoreSparkline } from "@core/ui/indicator";
import type { TravelDates } from "@features/tourism/hooks";
import { applyTagSeasonality } from "@features/tourism/utils";
import { useTranslation } from "react-i18next";

interface TourismCardTagSparklineProps {
  readonly country: CountryData;
  readonly selectedTags: readonly string[];
  readonly travelDates?: TravelDates;
}

export function TourismCardTagSparkline({
  country,
  selectedTags,
  travelDates,
}: TourismCardTagSparklineProps) {
  const { t } = useTranslation();
  return (
    <div className="hidden items-center gap-1 sm:flex">
      <ScoreSparkline
        entries={TOURISM_CATEGORY_KEYS.map((key) => ({
          key,
          value: country.scores[key].value ?? null,
          label: t(`tourism.metrics.${key}`, key),
        }))}
      />
      {selectedTags.length > 0 ? (
        <>
          <div className="mx-0.5 h-3 w-px bg-border" />
          {selectedTags.map((tag) => {
            const base = country.tourismTagScores?.[tag] ?? null;
            const val =
              base === null
                ? null
                : applyTagSeasonality(base, country.tourismTagSeasonality?.[tag], travelDates);
            return (
              <ScoreDot
                key={`tag-${tag}`}
                value={val}
                label={t(`tourismTags.${tag}`, tag)}
                shape="square"
              />
            );
          })}
        </>
      ) : null}
    </div>
  );
}
