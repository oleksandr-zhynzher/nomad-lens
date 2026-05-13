import type React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@core/ui";
import { TOURISM_COST_COLORS } from "@features/budget/constants";
import type { TourismBudgetBreakdown } from "@features/tourism/utils";

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
    <div className="relative h-5 overflow-hidden rounded-[4px] bg-surface-2">
      {/* Stacked segments scaled to maxVal */}
      <div
        className="flex h-full w-[var(--bw)]"
        style={{ "--bw": `${(dailyCost / maxVal) * 100}%` } as React.CSSProperties}
      >
        {segments.map((key) => (
          <Tooltip
            key={key}
            content={
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--sc)]"
                  style={{ "--sc": TOURISM_COST_COLORS[key] ?? "#555" } as React.CSSProperties}
                />
                <span className="text-[11px] text-tertiary">
                  {t(`tourismBudget.categories.${key}`, key)}
                </span>
                <span className="font-mono text-[11px] font-bold text-white">
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
              className="h-full w-full bg-[var(--sc)]"
              style={{ "--sc": TOURISM_COST_COLORS[key] ?? "#555" } as React.CSSProperties}
            />
          </Tooltip>
        ))}
      </div>
      {/* Budget threshold line */}
      <div
        className="absolute top-0 bottom-0 left-[var(--bl)] w-0.5 bg-white opacity-70"
        style={{ "--bl": `${(dailyBudget / maxVal) * 100}%` } as React.CSSProperties}
      />
    </div>
  );
}
