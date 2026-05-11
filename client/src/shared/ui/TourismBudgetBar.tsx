import { useTranslation } from "react-i18next";
import { Tooltip } from "../../components/Tooltip";
import { TOURISM_COST_COLORS } from "../../utils/budgetColors";
import type { TourismBudgetBreakdown } from "../../utils/tourismScoring";

const TOURISM_BUDGET_KEYS: (keyof TourismBudgetBreakdown)[] = [
  "accommodation",
  "food",
  "activities",
];

interface TourismBudgetBarProps {
  breakdown: TourismBudgetBreakdown;
  dailyCost: number;
  dailyBudget: number;
}

export function TourismBudgetBar({ breakdown, dailyCost, dailyBudget }: TourismBudgetBarProps) {
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
