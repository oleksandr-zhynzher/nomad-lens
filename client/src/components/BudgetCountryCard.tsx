import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  House,
  ShoppingCart,
  UtensilsCrossed,
  Bus,
  Zap,
  Laptop,
  Heart,
} from "lucide-react";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";
import { BudgetBreakdownChart } from "./BudgetBreakdownChart";
import { COST_COLORS, comfortScoreColour, surplusColour } from "../utils/budgetColors";
import { ViewCountryButton } from "../shared/ui/ViewCountryButton";
import { CompareCheckbox } from "../shared/ui/CompareCheckbox";
import { getRowStyles } from "../utils/rowStyles";
import { CountryNameCell } from "../shared/ui/CountryNameCell";

interface Props {
  match: BudgetMatch;
  budget: number;
  rank: number;
  expanded?: boolean;
  onToggle?: () => void;
  compareMode?: boolean;
  isSelected?: boolean;
}

export function BudgetCountryCard({
  match,
  budget,
  rank,
  expanded = false,
  onToggle,
  compareMode = false,
  isSelected = false,
}: Props) {
  const { country, comfortScore, monthlyCost, surplus, breakdown } = match;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(rank, isSelected);

  return (
    <div
      data-selected={isSelected ? "true" : undefined}
      className="country-row overflow-hidden transition-colors duration-150"
      style={{
        position: "relative",
        backgroundColor: rowBg,
        borderBottom: "1px solid #222",
        ["--row-hover-bg" as string]: hoverBg,
      }}
    >
      {/* Compare mode: checkbox */}
      {compareMode && <CompareCheckbox isSelected={!!isSelected} uncheckedBg={rowBg} />}

      {/* Main row — clickable button */}
      <button
        className="w-full text-left transition-colors"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px",
          paddingLeft: compareMode ? "38px" : "16px",
          background: "transparent",
          border: "none",
          cursor: compareMode ? "pointer" : "pointer",
          width: "100%",
        }}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Rank */}
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontWeight: 700,
              color: "var(--color-accent)",
              width: "28px",
              textAlign: "center",
              flexShrink: 0,
              fontSize: "16px",
            }}
          >
            {rank}
          </span>

          {/* Flag + Name + region */}
          <CountryNameCell country={country} />

          {/* Cost + surplus */}
          <div className="hidden sm:flex flex-col items-end" style={{ flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "13px",
                color: "#CCCCCC",
              }}
            >
              ${monthlyCost.toLocaleString()}
            </span>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "11px",
                color: surplusColour(surplus),
              }}
            >
              {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
            </span>
          </div>

          {/* Comfort score */}
          <div style={{ flexShrink: 0, width: "48px", textAlign: "right" }}>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "18px",
                fontWeight: 700,
                color: comfortScoreColour(comfortScore),
              }}
            >
              {comfortScore.toFixed(0)}
            </span>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={18}
            style={{
              color: "#757575",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
            className="shrink-0"
          />
        </div>

        {/* Breakdown bar */}
        <div style={{ marginTop: "8px", marginLeft: "60px" }}>
          <BudgetBreakdownChart breakdown={breakdown} budget={budget} monthlyCost={monthlyCost} />
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div
          className="px-4 py-4"
          style={{
            borderTop: `1px solid ${borderColor}`,
            backgroundColor: "#0A0A0A",
          }}
        >
          {/* Summary row */}
          <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              {t("budget.monthlyBreakdown", "Monthly breakdown")}
            </span>
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#CCCCCC",
                }}
              >
                ${monthlyCost.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: surplusColour(surplus),
                }}
              >
                {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}{" "}
                {t("budget.surplus", "surplus")}
              </span>
            </div>
          </div>

          {/* Category cards grid — matching CountryPage style */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "12px",
            }}
          >
            {(
              [
                {
                  key: "housing" as const,
                  icon: <House size={14} color={COST_COLORS.housing} />,
                  label: t("budget.categories.housing"),
                },
                {
                  key: "groceries" as const,
                  icon: <ShoppingCart size={14} color={COST_COLORS.groceries} />,
                  label: t("budget.categories.groceries"),
                },
                {
                  key: "dining" as const,
                  icon: <UtensilsCrossed size={14} color={COST_COLORS.dining} />,
                  label: t("budget.categories.dining"),
                },
                {
                  key: "transport" as const,
                  icon: <Bus size={14} color={COST_COLORS.transport} />,
                  label: t("budget.categories.transport"),
                },
                {
                  key: "utilities" as const,
                  icon: <Zap size={14} color={COST_COLORS.utilities} />,
                  label: t("budget.categories.utilities"),
                },
                {
                  key: "coworking" as const,
                  icon: <Laptop size={14} color={COST_COLORS.coworking} />,
                  label: t("budget.categories.coworking"),
                },
                {
                  key: "healthInsurance" as const,
                  icon: <Heart size={14} color={COST_COLORS.healthInsurance} />,
                  label: t("budget.categories.healthInsurance"),
                },
              ] as const
            )
              .filter(({ key }) => breakdown[key] > 0)
              .map(({ key, icon, label }) => (
                <div
                  key={key}
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "8px",
                    border: "1px solid #1E1E1E",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {icon}
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#E8E9EB",
                      }}
                    >
                      ${breakdown[key].toLocaleString()}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: "#808080",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
          </div>

          {/* View country details button — at the bottom */}
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      )}
    </div>
  );
}
