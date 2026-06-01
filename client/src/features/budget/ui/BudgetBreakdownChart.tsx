import { Tooltip } from "@core/ui";
import { BUDGET_CATEGORY_KEYS, COST_COLORS } from "@features/budget/constants";
import type { BudgetBreakdown } from "@features/budget/hooks";
import { useTranslation } from "react-i18next";

interface BudgetBreakdownChartProps {
  readonly breakdown: BudgetBreakdown;
  readonly budget: number;
  readonly monthlyCost: number;
}

export function BudgetBreakdownChart({
  breakdown,
  budget,
  monthlyCost,
}: BudgetBreakdownChartProps) {
  const { t } = useTranslation();
  const segments = BUDGET_CATEGORY_KEYS.filter((k) => breakdown[k] > 0);
  const maxVal = Math.max(monthlyCost, budget) * 1.1;

  return (
    <div className="relative h-5 overflow-hidden rounded-[4px] bg-surface-2">
      {/* Stacked segments */}
      <div
        className="flex h-full w-[var(--bw)]"
        style={{ "--bw": `${(monthlyCost / maxVal) * 100}%` } as React.CSSProperties}
      >
        {segments.map((key) => (
          <Tooltip
            key={key}
            content={
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div
                  className="size-2 shrink-0 rounded-full bg-[var(--seg-c)]"
                  style={{ "--seg-c": COST_COLORS[key] ?? "#555" } as React.CSSProperties}
                />
                <span className="text-[11px] text-tertiary">{t(`budget.categories.${key}`)}</span>
                <span className="font-mono text-[11px] font-bold text-white">
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
              className="h-full w-full bg-[var(--seg-c)]"
              style={{ "--seg-c": COST_COLORS[key] ?? "#555" } as React.CSSProperties}
            />
          </Tooltip>
        ))}
      </div>
      {/* Budget line */}
      <div
        className="absolute top-0 bottom-0 left-[var(--bl)] w-0.5 bg-white opacity-70"
        style={{ "--bl": `${(budget / maxVal) * 100}%` } as React.CSSProperties}
      />
    </div>
  );
}
