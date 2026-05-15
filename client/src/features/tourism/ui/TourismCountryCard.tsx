import type React from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TourismRanked } from "@features/tourism/utils";
import { applyTagSeasonality } from "@features/tourism/utils";
import { tourismScoreColourClass } from "@core/utils";
import { TOURISM_CATEGORY_KEYS } from "@core/models";
import type { TravelDates } from "@features/tourism/hooks";
import { CompareCheckbox } from "@features/compare/ui";
import { getRowStyles } from "@core/utils";
import { CountryNameCell } from "@core/ui/country";
import { ScoreDot } from "@core/ui/indicator";
import { ScoreSparkline } from "@core/ui/indicator";
import { TourismBudgetBar } from "./TourismBudgetBar";
import { TourismCountryCardDetail } from "./TourismCountryCardDetail";

interface TourismCountryCardProps {
  readonly ranked: TourismRanked;
  readonly index: number;
  readonly highlighted?: boolean;
  readonly expanded?: boolean;
  readonly onToggle?: () => void;
  readonly onSelect?: () => void;
  readonly compareMode?: boolean;
  readonly isSelected?: boolean;
  readonly selectedTags?: readonly string[];
  readonly travelDates?: TravelDates;
}

export function TourismCountryCard({
  ranked,
  index,
  highlighted = false,
  expanded = false,
  onToggle,
  onSelect,
  compareMode = false,
  isSelected = false,
  selectedTags = [],
  travelDates,
}: TourismCountryCardProps) {
  const { country, tourismScore, rank } = ranked;
  const { t } = useTranslation();

  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(index, isSelected);
  const chevronRotation = expanded ? "rotate-90" : "rotate-0";

  return (
    <div
      data-country-code={country.code}
      data-selected={isSelected ? "true" : undefined}
      className={`country-row relative overflow-hidden transition-colors duration-150 ${compareMode ? "pl-[38px]" : "pl-0"} border-t border-[var(--row-bt)] bg-[var(--row-bg)] ${highlighted ? "outline outline-2 -outline-offset-1 outline-[var(--color-accent)]" : ""}`}
      style={
        {
          "--row-bg": rowBg,
          "--row-bt": highlighted ? "var(--color-accent)" : borderColor,
          "--row-hover-bg": hoverBg,
        } as React.CSSProperties
      }
    >
      {compareMode ? <CompareCheckbox isSelected={isSelected} uncheckedBg={rowBg} /> : null}

      <button
        className={`flex min-h-14 w-full cursor-pointer flex-col border-none bg-transparent text-left transition-colors ${compareMode ? "pr-4 pl-[38px]" : "px-4"} py-3`}
        onClick={compareMode ? onSelect : onToggle}
        aria-expanded={expanded}
      >
        <div className="flex w-full items-center gap-2 md:gap-4">
          {/* Rank */}
          <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent md:text-lg">
            {rank}
          </span>

          {/* Flag + Name + region */}
          <CountryNameCell country={country} />

          {/* Sparkline dots — tourism score categories + tag dots */}
          <div className="hidden items-center gap-1 sm:flex">
            <ScoreSparkline
              entries={TOURISM_CATEGORY_KEYS.map((key) => ({
                key,
                value: country.scores[key].value ?? null,
                label: t(`tourism.metrics.${key}`, key),
              }))}
            />
            {/* Tag quality dots — only shown when tags are selected */}
            {selectedTags.length > 0 ? (
              <>
                <div className="mx-0.5 h-3 w-px bg-border" />
                {selectedTags.map((tag) => {
                  const baseVal = country.tourismTagScores?.[tag] ?? null;
                  const val =
                    baseVal === null
                      ? null
                      : applyTagSeasonality(
                          baseVal,
                          country.tourismTagSeasonality?.[tag],
                          travelDates,
                        );
                  const label = t(`tourismTags.${tag}`, tag);
                  return <ScoreDot key={`tag-${tag}`} value={val} label={label} shape="square" />;
                })}
              </>
            ) : null}
          </div>

          {/* Cost + surplus (daily) */}
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

          {/* Final score */}
          <div className="w-12 shrink-0 text-right">
            <span
              className={`font-mono text-lg font-bold md:text-xl ${tourismScoreColourClass(tourismScore, "text")}`}
            >
              {tourismScore.toFixed(0)}
            </span>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={20}
            className={`shrink-0 text-dimmest transition-transform duration-200 ${compareMode ? "rotate-0 opacity-[0.35]" : chevronRotation}`}
          />
        </div>

        {/* Breakdown bar — matches BudgetCountryCard */}
        {ranked.budgetMatch ? (
          <div className="mt-2 ml-[60px]">
            <TourismBudgetBar
              breakdown={ranked.budgetMatch.breakdown}
              dailyCost={ranked.budgetMatch.dailyCost}
              dailyBudget={ranked.budgetMatch.dailyCost + ranked.budgetMatch.surplus}
            />
          </div>
        ) : null}
      </button>

      {/* Expanded detail */}
      {expanded && !compareMode ? (
        <TourismCountryCardDetail
          country={country}
          budgetMatch={ranked.budgetMatch}
          borderColor={borderColor}
        />
      ) : null}
    </div>
  );
}
