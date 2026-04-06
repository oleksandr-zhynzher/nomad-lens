import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  User,
  House,
  ShoppingCart,
  UtensilsCrossed,
  Bus,
  Zap,
  Laptop,
  Heart,
} from "lucide-react";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useLocalizedCountry, regionKey } from "../utils/localize";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";
import { BudgetBreakdownChart } from "./BudgetBreakdownChart";
import { COST_COLORS } from "../utils/budgetColors";

function scoreColor(score: number): string {
  if (score >= 70) return "#4CAF50";
  if (score >= 50) return "#8BC34A";
  if (score >= 30) return "#FFC107";
  return "#FF5722";
}

function surplusColor(surplus: number): string {
  if (surplus > 200) return "#4CAF50";
  if (surplus >= 0) return "#8BC34A";
  if (surplus >= -200) return "#FFC107";
  return "#FF5722";
}

interface Props {
  match: BudgetMatch;
  budget: number;
  rank: number;
  expanded?: boolean;
  onToggle?: () => void;
}

export function BudgetCountryCard({
  match,
  budget,
  rank,
  expanded = false,
  onToggle,
}: Props) {
  const { country, comfortScore, monthlyCost, surplus, breakdown } = match;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const locC = useLocalizedCountry(country);

  const isEven = rank % 2 === 0;
  const borderColor = isEven ? "#252527" : "#1F1F21";

  return (
    <div
      className="overflow-hidden transition-colors duration-150"
      style={{
        backgroundColor: isEven ? "#1A1A1C" : "#161618",
        borderBottom: "1px solid #222",
      }}
    >
      {/* Main row — clickable button */}
      <button
        className="w-full text-left transition-colors"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
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

          {/* Flag */}
          <img
            src={country.flagUrl}
            alt={locC.name}
            style={{
              width: "24px",
              height: "16px",
              borderRadius: "2px",
              objectFit: "cover",
            }}
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
                margin: 0,
              }}
            >
              {locC.name}
            </p>
            <span
              className="hidden sm:inline shrink-0"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#555555",
              }}
            >
              {t(`regions.${regionKey(country.region)}`)}
            </span>
          </div>

          {/* Cost + surplus */}
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
              ${monthlyCost.toLocaleString()}
            </span>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "11px",
                color: surplusColor(surplus),
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
                color: scoreColor(comfortScore),
              }}
            >
              {comfortScore.toFixed(0)}
            </span>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={18}
            style={{
              color: "#333333",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
            className="shrink-0"
          />
        </div>

        {/* Breakdown bar */}
        <div style={{ marginTop: "8px", marginLeft: "60px" }}>
          <BudgetBreakdownChart
            breakdown={breakdown}
            budget={budget}
            monthlyCost={monthlyCost}
          />
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
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "12px" }}
          >
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
                  color: surplusColor(surplus),
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
                  icon: (
                    <ShoppingCart size={14} color={COST_COLORS.groceries} />
                  ),
                  label: t("budget.categories.groceries"),
                },
                {
                  key: "dining" as const,
                  icon: (
                    <UtensilsCrossed size={14} color={COST_COLORS.dining} />
                  ),
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
                      color: "#555555",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
          </div>

          {/* View country details button — at the bottom */}
          <Link
            to={`${langPrefix}/country/${country.code.toLowerCase()}`}
            className="w-full flex items-center justify-center gap-2 transition-colors"
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
            <User size={14} />
            {t("countryPage.viewProfile", "View Country Details")}
          </Link>
        </div>
      )}
    </div>
  );
}
