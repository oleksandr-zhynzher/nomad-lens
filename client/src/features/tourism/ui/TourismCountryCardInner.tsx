import { ChevronRight } from "lucide-react";
import type { TourismRanked } from "@features/tourism/utils";
import { tourismScoreColourClass } from "@core/utils";
import type { TravelDates } from "@features/tourism/hooks";
import { CountryNameCell } from "@core/ui/country";
import { TourismBudgetBar } from "./TourismBudgetBar";
import { TourismCardTagSparkline } from "./TourismCardTagSparkline";

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

  return (
    <>
      <div className="flex w-full items-center gap-2 md:gap-4">
        <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent md:text-lg">
          {rank}
        </span>

        <CountryNameCell country={country} />

        <TourismCardTagSparkline
          country={country}
          selectedTags={selectedTags}
          travelDates={travelDates}
        />

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
