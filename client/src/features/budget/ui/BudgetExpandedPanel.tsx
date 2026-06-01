import { MetricCard, MetricGrid } from "@core/ui";
import { ViewCountryButton } from "@core/ui/country";
import { surplusColourClass } from "@core/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import { getBudgetCountryCardBreakdownItems } from "@features/budget/utils/budget-country-card.utils";
import type React from "react";
import { useTranslation } from "react-i18next";

interface BudgetExpandedPanelProps {
  readonly match: BudgetMatch;
  readonly borderColor: string;
  readonly langPrefix: string;
}

export function BudgetExpandedPanel({ match, borderColor, langPrefix }: BudgetExpandedPanelProps) {
  const { country, monthlyCost, surplus, breakdown } = match;
  const { t } = useTranslation();
  const breakdownCards = getBudgetCountryCardBreakdownItems(breakdown, t);
  return (
    <div
      className="border-t border-[var(--bc)] bg-[#0A0A0A] p-4"
      style={{ "--bc": borderColor } as React.CSSProperties}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-white">
          {t("budget.monthlyBreakdown", "Monthly breakdown")}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] font-bold text-tertiary">
            ${monthlyCost.toLocaleString()}
          </span>
          <span
            className={`font-mono text-xs font-semibold ${surplusColourClass(surplus, "text")}`}
          >
            {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()} {t("budget.surplus", "surplus")}
          </span>
        </div>
      </div>
      <MetricGrid>
        {breakdownCards.map(({ key, Icon, color, label, value }) => (
          <MetricCard
            key={key}
            icon={<Icon size={14} color={color} aria-hidden />}
            label={label}
            value={`$${value.toLocaleString()}`}
          />
        ))}
      </MetricGrid>
      <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
    </div>
  );
}
