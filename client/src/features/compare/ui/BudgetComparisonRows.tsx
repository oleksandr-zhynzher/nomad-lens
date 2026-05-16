import {
  BREAKDOWN_ROWS,
  BUDGET_COMPARISON_COLUMN_WIDTH,
  COST_COLORS,
  surplusColour,
} from "@features/budget/constants";
import type { BudgetMatch } from "@features/budget/hooks";
import { costColor } from "@features/budget/utils";
import { TrendingUp, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";

interface ComparisonSlot {
  readonly country: { code: string };
  readonly color: string;
  readonly index: number;
}

interface BudgetComparisonRowsProps {
  readonly sortedSlots: ComparisonSlot[];
  readonly matchMap: Map<string, BudgetMatch>;
}

export function BudgetComparisonRows({ sortedSlots, matchMap }: BudgetComparisonRowsProps) {
  const { t } = useTranslation();
  const minBreakdown: Record<string, number> = {};
  for (const { key } of BREAKDOWN_ROWS) {
    const vals = sortedSlots.map((s) => matchMap.get(s.country.code)?.breakdown[key] ?? 0);
    minBreakdown[key] = vals.length > 0 ? Math.min(...vals) : 0;
  }
  const minTotal =
    sortedSlots.length > 0
      ? Math.min(...sortedSlots.map((s) => matchMap.get(s.country.code)?.monthlyCost ?? 0))
      : 0;
  return (
    <>
      <ComparisonRowShell
        icon={Wallet}
        iconColor="#C2956A"
        label={t("budget.totalMonthly", "Monthly Total")}
      >
        {sortedSlots.map((slot) => {
          const val = matchMap.get(slot.country.code)?.monthlyCost ?? null;
          return (
            <ComparisonScoreCell
              key={slot.index}
              value={val}
              colour={val == null ? "#333333" : costColor(val, minTotal)}
              format={(v) => `$${v.toLocaleString()}`}
              columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
            />
          );
        })}
      </ComparisonRowShell>
      <ComparisonRowShell
        icon={TrendingUp}
        iconColor="#4CAF50"
        label={t("budget.surplus", "Surplus")}
      >
        {sortedSlots.map((slot) => {
          const match = matchMap.get(slot.country.code);
          const val = match === undefined ? null : match.surplus;
          return (
            <ComparisonScoreCell
              key={slot.index}
              value={val}
              colour={val == null ? "#333333" : surplusColour(val)}
              format={(v) =>
                v >= 0 ? `+$${v.toLocaleString()}` : `-$${Math.abs(v).toLocaleString()}`
              }
              columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
            />
          );
        })}
      </ComparisonRowShell>
      {BREAKDOWN_ROWS.map(({ key, icon: Icon }) => (
        <ComparisonRowShell
          key={key}
          icon={Icon}
          iconColor={COST_COLORS[key] ?? "#888"}
          label={t(`budget.categories.${key}`, key)}
        >
          {sortedSlots.map((slot) => {
            const val = matchMap.get(slot.country.code)?.breakdown[key] ?? null;
            return (
              <ComparisonScoreCell
                key={slot.index}
                value={val}
                colour={val == null ? "#333333" : costColor(val, minBreakdown[key] ?? 0)}
                format={(v) => `$${v.toLocaleString()}`}
                columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
              />
            );
          })}
        </ComparisonRowShell>
      ))}
    </>
  );
}
