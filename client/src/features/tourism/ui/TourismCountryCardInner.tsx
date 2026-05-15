import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TourismRanked } from "@features/tourism/utils";
import { applyTagSeasonality } from "@features/tourism/utils";
import { tourismScoreColourClass } from "@core/utils";
import { TOURISM_CATEGORY_KEYS } from "@core/models";
import type { TravelDates } from "@features/tourism/hooks";
import { CountryNameCell } from "@core/ui/country";
import { ScoreDot, ScoreSparkline } from "@core/ui/indicator";
import { TourismBudgetBar } from "./TourismBudgetBar";

interface TourismCountryCardInnerProps {
  readonly ranked: TourismRanked;
  readonly expanded: boolean;
  readonly compareMode: boolean;
  readonly selectedTags: readonly string[];
  readonly travelDates?: TravelDates;
}

export function TourismCountryCardInner({
  ranked,
  expanded,
  compareMode,
  selectedTags,
  travelDates,
}: TourismCountryCardInnerProps) {
  const { country, tourismScore, rank } = ranked;
  const { t } = useTranslation();

  return (
    <>
      <div className="flex w-full items-center gap-2 md:gap-4">
        <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent md:text-lg">
          {rank}
        </span>

        <CountryNameCell country={country} />

        <div className="hidden items-center gap-1 sm:flex">
          <ScoreSparkline
            entries={TOURISM_CATEGORY_KEYS.map((key) => ({
              key,
              value: country.scores[key].value ?? null,
              label: t(`tourism.metrics.${key}`, key),
            }))}
          />
          {selectedTags.length > 0 && (
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
          )}
        </div>

        {ranked.budgetMatch ? (
          <div className="hidden shrink-0 flex-col items-end sm:flex">
            <span className="font-mono text-[13px] text-tertiary">
              ${ranked.budgetMatch.dailyCost}/d
            </span>
            <span
              className={`font-mono text-[11px] ${ranked.budgetMatch.surplus >= 0 ? "text-success" : "text-danger"}`}
            >
              {ranked.budgetMatch.surplus >= 0 ? "+" : ""}${ranked.budgetMatch.surplus}/d
            </span>
          </div>
        ) : null}

        <div className="w-12 shrink-0 text-right">
          <span
            className={`font-mono text-lg font-bold md:text-xl ${tourismScoreColourClass(tourismScore, "text")}`}
          >
            {tourismScore.toFixed(0)}
          </span>
        </div>

        <ChevronRight
          size={20}
          className={`shrink-0 text-dimmest transition-transform duration-200 ${compareMode ? "rotate-0 opacity-[0.35]" : expanded ? "rotate-90" : "rotate-0"}`}
        />
      </div>

      {ranked.budgetMatch ? (
        <div className="mt-2 ml-[60px]">
          <TourismBudgetBar
            breakdown={ranked.budgetMatch.breakdown}
            dailyCost={ranked.budgetMatch.dailyCost}
            dailyBudget={ranked.budgetMatch.dailyCost + ranked.budgetMatch.surplus}
          />
        </div>
      ) : null}
    </>
  );
}
