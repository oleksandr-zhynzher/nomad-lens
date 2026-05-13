import { useTranslation } from "react-i18next";
import type { BudgetBreakdown } from "@features/budget/hooks";
import { Tooltip } from "@core/ui";
import { COST_COLORS } from "@features/budget/constants";
import { BUDGET_CATEGORY_KEYS } from "@features/budget/constants";

interface Props {
  breakdown: BudgetBreakdown;
  budget: number;
  monthlyCost: number;
}

export function BudgetBreakdownChart({ breakdown, budget, monthlyCost }: Props) {
  const { t } = useTranslation();
  const segments = BUDGET_CATEGORY_KEYS.filter((k) => breakdown[k] > 0);
  const maxVal = Math.max(monthlyCost, budget) * 1.1;

  return (
    <div className="relative h-5 rounded-[4px] overflow-hidden bg-surface-2">
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
                  className="w-2 h-2 rounded-full shrink-0 bg-[var(--seg-c)]"
                  style={{ "--seg-c": COST_COLORS[key] ?? "#555" } as React.CSSProperties}
                />
                <span className="text-[11px] text-tertiary">{t(`budget.categories.${key}`)}</span>
                <span className="text-[11px] font-bold font-mono text-white">
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
              className="w-full h-full bg-[var(--seg-c)]"
              style={{ "--seg-c": COST_COLORS[key] ?? "#555" } as React.CSSProperties}
            />
          </Tooltip>
        ))}
      </div>
      {/* Budget line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white opacity-70 left-[var(--bl)]"
        style={{ "--bl": `${(budget / maxVal) * 100}%` } as React.CSSProperties}
      />
    </div>
  );
}
