import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TourismRanked } from "../utils/tourismScoring";
import { applyTagSeasonality } from "../utils/tourismScoring";
import { scoreColour } from "../utils/scoring";
import { TOURISM_CATEGORY_KEYS } from "../utils/types";
import type { TravelDates } from "../hooks/useTourismWeightState";
import { CompareCheckbox } from "../shared/ui/CompareCheckbox";
import { getRowStyles } from "../utils/rowStyles";
import { CountryNameCell } from "../shared/ui/CountryNameCell";
import { ScoreSparkline } from "../shared/ui/ScoreSparkline";
import { ScoreDot } from "../shared/ui/ScoreDot";
import { TourismBudgetBar } from "../shared/ui/TourismBudgetBar";
import { TourismCountryCardDetail } from "../shared/ui/TourismCountryCardDetail";

interface Props {
  ranked: TourismRanked;
  index: number;
  highlighted?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
  compareMode?: boolean;
  isSelected?: boolean;
  selectedTags?: string[];
  travelDates?: TravelDates;
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
}: Props) {
  const { country, tourismScore, rank } = ranked;
  const { t } = useTranslation();

  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(index, isSelected);

  return (
    <div
      data-country-code={country.code}
      data-selected={isSelected ? "true" : undefined}
      className="country-row overflow-hidden transition-colors duration-150"
      style={{
        position: "relative",
        backgroundColor: rowBg,
        borderTop: `1px solid ${highlighted ? "var(--color-accent)" : borderColor}`,
        ["--row-hover-bg" as string]: hoverBg,
        paddingLeft: compareMode ? "38px" : 0,
        ...(highlighted && {
          outline: `2px solid var(--color-accent)`,
          outlineOffset: "-1px",
        }),
      }}
    >
      {compareMode && <CompareCheckbox isSelected={!!isSelected} uncheckedBg={rowBg} />}

      <button
        className="w-full text-left transition-colors cursor-pointer"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px",
          paddingLeft: compareMode ? "38px" : "16px",
          minHeight: "56px",
          backgroundColor: "transparent",
          border: "none",
        }}
        onClick={compareMode ? onSelect : onToggle}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 md:gap-4 w-full">
          {/* Rank */}
          <span
            className="text-base md:text-lg"
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontWeight: 700,
              color: "var(--color-accent)",
              width: "28px",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {rank}
          </span>

          {/* Flag + Name + region */}
          <CountryNameCell country={country} />

          {/* Sparkline dots — tourism score categories + tag dots */}
          <div className="hidden sm:flex gap-1 items-center">
            <ScoreSparkline
              entries={TOURISM_CATEGORY_KEYS.map((key) => ({
                key,
                value: country.scores[key]?.value ?? null,
                label: t(`tourism.metrics.${key}`, key),
              }))}
            />
            {/* Tag quality dots — only shown when tags are selected */}
            {selectedTags.length > 0 && (
              <>
                <div
                  style={{
                    width: "1px",
                    height: "12px",
                    backgroundColor: "#333",
                    margin: "0 2px",
                  }}
                />
                {selectedTags.map((tag) => {
                  const baseVal = country.tourismTagScores?.[tag] ?? null;
                  const val =
                    baseVal !== null
                      ? applyTagSeasonality(
                          baseVal,
                          country.tourismTagSeasonality?.[tag],
                          travelDates,
                        )
                      : null;
                  const label = t(`tourismTags.${tag}`, tag);
                  return <ScoreDot key={`tag-${tag}`} value={val} label={label} shape="square" />;
                })}
              </>
            )}
          </div>

          {/* Cost + surplus (daily) */}
          {ranked.budgetMatch && (
            <div className="hidden sm:flex flex-col items-end" style={{ flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "13px",
                  color: "#CCCCCC",
                }}
              >
                ${ranked.budgetMatch.dailyCost}/d
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "11px",
                  color: ranked.budgetMatch.surplus >= 0 ? "#4CAF50" : "#FF5722",
                }}
              >
                {ranked.budgetMatch.surplus >= 0 ? "+" : ""}${ranked.budgetMatch.surplus}/d
              </span>
            </div>
          )}

          {/* Final score */}
          <div style={{ flexShrink: 0, width: "48px", textAlign: "right" }}>
            <span
              className="text-lg md:text-xl"
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 700,
                color: scoreColour(tourismScore),
              }}
            >
              {tourismScore.toFixed(0)}
            </span>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={20}
            style={{
              color: "#757575",
              transition: "transform 0.2s",
              transform: compareMode ? "rotate(0deg)" : expanded ? "rotate(90deg)" : "rotate(0deg)",
              opacity: compareMode ? 0.35 : 1,
            }}
            className="shrink-0"
          />
        </div>

        {/* Breakdown bar — matches BudgetCountryCard */}
        {ranked.budgetMatch && (
          <div style={{ marginTop: "8px", marginLeft: "60px" }}>
            <TourismBudgetBar
              breakdown={ranked.budgetMatch.breakdown}
              dailyCost={ranked.budgetMatch.dailyCost}
              dailyBudget={ranked.budgetMatch.dailyCost + ranked.budgetMatch.surplus}
            />
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && !compareMode && (
        <TourismCountryCardDetail
          country={country}
          budgetMatch={ranked.budgetMatch}
          borderColor={borderColor}
        />
      )}
    </div>
  );
}
