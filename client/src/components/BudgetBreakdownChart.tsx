import { useTranslation } from "react-i18next";
import type { BudgetBreakdown } from "../hooks/useBudgetMatcher";
import { Tooltip } from "./Tooltip";
import { COST_COLORS } from "../utils/budgetColors";

const CATEGORY_KEYS: (keyof BudgetBreakdown)[] = [
  "housing",
  "groceries",
  "dining",
  "transport",
  "utilities",
  "coworking",
  "healthInsurance",
];

interface Props {
  breakdown: BudgetBreakdown;
  budget: number;
  monthlyCost: number;
}

export function BudgetBreakdownChart({
  breakdown,
  budget,
  monthlyCost,
}: Props) {
  const { t } = useTranslation();
  const segments = CATEGORY_KEYS.filter((k) => breakdown[k] > 0);
  const maxVal = Math.max(monthlyCost, budget) * 1.1;

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
      {/* Stacked segments */}
      <div
        style={{
          display: "flex",
          height: "100%",
          width: `${(monthlyCost / maxVal) * 100}%`,
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
                    backgroundColor: COST_COLORS[key] ?? "#555",
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
                  {t(`budget.categories.${key}`)}
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
              width: `${(breakdown[key] / monthlyCost) * 100}%`,
              height: "100%",
              minWidth: "2px",
            }}
          >
            <div
              style={{
                width: "100%",
                backgroundColor: COST_COLORS[key] ?? "#555",
                height: "100%",
              }}
            />
          </Tooltip>
        ))}
      </div>
      {/* Budget line */}
      <div
        style={{
          position: "absolute",
          left: `${(budget / maxVal) * 100}%`,
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
