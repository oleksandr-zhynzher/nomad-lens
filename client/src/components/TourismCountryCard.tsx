import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useLocalizedCountry, regionKey } from "../utils/localize";
import type { TourismRanked } from "../utils/tourismScoring";
import { scoreColour } from "../utils/scoring";
import { TOURISM_CATEGORY_KEYS } from "../utils/types";
import { TourismBreakdownChart } from "./TourismBreakdownChart";
import { Tooltip } from "./Tooltip";
import { TOURISM_COST_COLORS } from "../utils/budgetColors";
import type { TravelDates } from "../hooks/useTourismWeightState";

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
  const langPrefix = useLangPrefix();
  const locC = useLocalizedCountry(country);

  const isEven = index % 2 === 0;
  const rowBg = isSelected ? "#1A2A1A" : isEven ? "#1A1A1C" : "#161618";
  const hoverBg = isEven ? "#232326" : "#202023";
  const borderColor = isEven ? "#252527" : "#1F1F21";

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
      {compareMode && (
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 3,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "3px",
              border: `2px solid ${isSelected ? "var(--color-accent)" : "#404040"}`,
              backgroundColor: isSelected ? "var(--color-accent)" : rowBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSelected && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path
                  d="M1 3.5L3.5 6L8 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      )}

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

          {/* Flag */}
          <img
            src={country.flagUrl}
            alt={t("tourism.a11y.flagAlt", {
              country: locC.name,
              defaultValue: "{{country}} flag",
            })}
            className="object-cover shrink-0"
            style={{ width: "24px", height: "16px", borderRadius: "2px" }}
            loading="lazy"
          />

          {/* Name + region */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <p
              className="truncate"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              {locC.name}
            </p>
            <span
              className="hidden sm:inline shrink-0"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#808080",
              }}
            >
              {t(`regions.${regionKey(country.region)}`, country.region)}
            </span>
          </div>

          {/* Sparkline dots — tourism score categories */}
          <div className="hidden sm:flex gap-1 items-center">
            {TOURISM_CATEGORY_KEYS.map((key) => {
              const val = country.scores[key]?.value ?? null;
              const label = t(`tourism.metrics.${key}`, key);
              const tooltipContent = (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#CCCCCC",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: "IBM Plex Mono, monospace",
                      color: dotColour(val),
                    }}
                  >
                    {val !== null ? val.toFixed(1) : "—"}
                  </span>
                </div>
              );
              return (
                <Tooltip key={key} content={tooltipContent} side="top">
                  <div
                    className="rounded-full cursor-default"
                    role="img"
                    aria-label={`${label}: ${val !== null ? val.toFixed(1) : "N/A"}`}
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: dotColour(val),
                    }}
                  />
                </Tooltip>
              );
            })}
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
                  // Apply seasonal multiplier if travel dates are set
                  let val = baseVal;
                  if (
                    val !== null &&
                    travelDates?.startDate &&
                    travelDates?.endDate
                  ) {
                    const seasonality = country.tourismTagSeasonality?.[tag];
                    if (seasonality && seasonality.length === 12) {
                      const start = new Date(
                        travelDates.startDate + "T00:00:00",
                      );
                      const end = new Date(travelDates.endDate + "T00:00:00");
                      if (
                        !isNaN(start.getTime()) &&
                        !isNaN(end.getTime()) &&
                        end >= start
                      ) {
                        let wSum = 0;
                        let days = 0;
                        const cursor = new Date(start);
                        while (cursor <= end) {
                          wSum += seasonality[cursor.getMonth()];
                          days++;
                          cursor.setDate(cursor.getDate() + 1);
                        }
                        if (days > 0)
                          val = Math.round(val * (wSum / days / 100) * 10) / 10;
                      }
                    }
                  }
                  const label = t(`tourismTags.${tag}`, tag);
                  const tooltipContent = (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#CCCCCC",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          fontFamily: "IBM Plex Mono, monospace",
                          color: dotColour(val),
                        }}
                      >
                        {val !== null ? val.toFixed(1) : "—"}
                      </span>
                    </div>
                  );
                  return (
                    <Tooltip
                      key={`tag-${tag}`}
                      content={tooltipContent}
                      side="top"
                    >
                      <div
                        className="cursor-default"
                        role="img"
                        aria-label={`${label}: ${val !== null ? val.toFixed(1) : "N/A"}`}
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: dotColour(val),
                          borderRadius: "2px",
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </>
            )}
          </div>

          {/* Cost + surplus (daily) */}
          {ranked.budgetMatch && (
            <div
              className="hidden sm:flex flex-col items-end"
              style={{ flexShrink: 0 }}
            >
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
                  color:
                    ranked.budgetMatch.surplus >= 0 ? "#4CAF50" : "#FF5722",
                }}
              >
                {ranked.budgetMatch.surplus >= 0 ? "+" : ""}$
                {ranked.budgetMatch.surplus}/d
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
              transform: compareMode
                ? "rotate(0deg)"
                : expanded
                  ? "rotate(90deg)"
                  : "rotate(0deg)",
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
              dailyBudget={
                ranked.budgetMatch.dailyCost + ranked.budgetMatch.surplus
              }
            />
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && !compareMode && (
        <div
          className="px-4 py-4"
          style={{
            borderTop: `1px solid ${borderColor}`,
            backgroundColor: "#111113",
          }}
        >
          <TourismBreakdownChart country={country} />

          {/* Budget breakdown */}
          {ranked.budgetMatch && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#0D0D0F",
                borderRadius: "6px",
                border: "1px solid #242424",
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#9E9E9E",
                  marginBottom: "10px",
                }}
              >
                {t("tourismBudget.costBreakdown", "Daily Cost Breakdown")}
              </div>
              {(["accommodation", "food", "activities"] as const).map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between"
                  style={{ padding: "4px 0" }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#CCCCCC",
                    }}
                  >
                    {t(
                      `tourismBudget.categories.${cat}`,
                      cat.charAt(0).toUpperCase() + cat.slice(1),
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#E8E9EB",
                    }}
                  >
                    ${ranked.budgetMatch!.breakdown[cat]}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between"
                style={{
                  borderTop: "1px solid #333333",
                  marginTop: "6px",
                  paddingTop: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  {t("tourismBudget.total", "Total")}
                </span>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    color:
                      ranked.budgetMatch.surplus >= 0 ? "#4CAF50" : "#FF5722",
                  }}
                >
                  ${ranked.budgetMatch.dailyCost}/day
                </span>
              </div>
              {ranked.budgetMatch.surplus !== 0 && (
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "11px",
                    color:
                      ranked.budgetMatch.surplus >= 0 ? "#4CAF50" : "#FF5722",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {ranked.budgetMatch.surplus >= 0 ? "+" : ""}$
                  {ranked.budgetMatch.surplus}{" "}
                  {t("tourismBudget.surplus", "surplus")}
                </div>
              )}
            </div>
          )}

          <Link
            to={`${langPrefix}/country/${country.code.toLowerCase()}`}
            className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors"
            style={{
              display: "flex",
              height: "40px",
              backgroundColor: "transparent",
              border: "1px solid #333333",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-accent-dim)",
              textDecoration: "none",
              marginTop: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {t("tourism.viewCountry", "View Profile")} →
          </Link>
        </div>
      )}
    </div>
  );
}

function dotColour(value: number | null): string {
  if (value === null) return "#3A3A3A";
  if (value >= 75) return "#4CAF50";
  if (value >= 60) return "#8BC34A";
  if (value >= 50) return "#FFC107";
  return "#FF5722";
}

const TOURISM_BUDGET_KEYS: (keyof import("../utils/tourismScoring").TourismBudgetBreakdown)[] =
  ["accommodation", "food", "activities"];

function TourismBudgetBar({
  breakdown,
  dailyCost,
  dailyBudget,
}: {
  breakdown: import("../utils/tourismScoring").TourismBudgetBreakdown;
  dailyCost: number;
  dailyBudget: number;
}) {
  const { t } = useTranslation();
  const segments = TOURISM_BUDGET_KEYS.filter((k) => breakdown[k] > 0);
  const maxVal = Math.max(dailyCost, dailyBudget) * 1.1;

  return (
    <div
      style={{
        position: "relative",
        height: "20px",
        borderRadius: "4px",
        overflow: "hidden",
        backgroundColor: "#222",
      }}
    >
      {/* Stacked segments scaled to maxVal */}
      <div
        style={{
          display: "flex",
          height: "100%",
          width: `${(dailyCost / maxVal) * 100}%`,
        }}
      >
        {segments.map((key) => (
          <Tooltip
            key={key}
            content={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: TOURISM_COST_COLORS[key] ?? "#555",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#CCCCCC",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t(`tourismBudget.categories.${key}`, key)}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#FFFFFF",
                  }}
                >
                  ${breakdown[key]}
                </span>
              </div>
            }
            side="top"
            triggerStyle={{
              width: `${(breakdown[key] / dailyCost) * 100}%`,
              height: "100%",
              minWidth: "2px",
            }}
          >
            <div
              style={{
                width: "100%",
                backgroundColor: TOURISM_COST_COLORS[key] ?? "#555",
                height: "100%",
              }}
            />
          </Tooltip>
        ))}
      </div>
      {/* Budget threshold line */}
      <div
        style={{
          position: "absolute",
          left: `${(dailyBudget / maxVal) * 100}%`,
          top: 0,
          bottom: 0,
          width: "2px",
          backgroundColor: "#FFFFFF",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
