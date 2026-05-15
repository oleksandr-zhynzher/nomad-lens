import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Wallet, TrendingUp } from "lucide-react";
import type { CountryData } from "@core/models";
import { localizeCountry } from "@core/utils";
import {
  COST_COLORS,
  surplusColour,
  BREAKDOWN_ROWS,
  BUDGET_COMPARISON_COLUMN_WIDTH,
} from "@features/budget/constants";
import { costColor } from "@features/budget/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import { ComparisonRowShell } from "./ComparisonRowShell";
import { ComparisonScoreCell } from "./ComparisonScoreCell";
import { ComparisonTableHeader } from "./ComparisonTableHeader";

interface ComparisonSlot {
  readonly country: CountryData;
  readonly color: string;
  readonly index: number;
}

interface BudgetComparisonGridProps {
  readonly sortedSlots: ComparisonSlot[];
  readonly matchMap: Map<string, BudgetMatch>;
  readonly minBreakdown: Record<string, number>;
  readonly minTotal: number;
  readonly headerRef: RefObject<HTMLDivElement | null>;
  readonly bodyRef: RefObject<HTMLDivElement | null>;
  readonly lang: string;
}

export function BudgetComparisonGrid({
  sortedSlots,
  matchMap,
  minBreakdown,
  minTotal,
  headerRef,
  bodyRef,
  lang,
}: BudgetComparisonGridProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <div className="h-px bg-[#1C1C1C]" />
      <ComparisonTableHeader
        ref={headerRef}
        label={t("compare.indicatorHeader", "Category")}
        columns={sortedSlots.map((slot) => ({
          key: slot.index,
          flagUrl: slot.country.flagUrl,
          name: localizeCountry(slot.country, lang).name,
        }))}
        columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
      />
      <div ref={bodyRef} className="overflow-x-auto">
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
                  colour={val == null ? "#333333" : costColor(val, minBreakdown[key])}
                  format={(v) => `$${v.toLocaleString()}`}
                  columnWidth={BUDGET_COMPARISON_COLUMN_WIDTH}
                />
              );
            })}
          </ComparisonRowShell>
        ))}
      </div>
    </div>
  );
}
