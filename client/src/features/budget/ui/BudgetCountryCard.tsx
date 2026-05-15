import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useLangPrefix } from "@core/hooks";
import type { BudgetMatch } from "@features/budget/hooks";
import { BudgetBreakdownChart } from "./BudgetBreakdownChart";
import { surplusColourClass, comfortScoreColourClass } from "@core/utils";
import { ViewCountryButton } from "@core/ui/country";
import { CompareCheckbox } from "@features/compare/ui";
import { getRowStyles } from "@core/utils";
import { CountryNameCell } from "@core/ui/country";
import { MetricCard, MetricGrid } from "@core/ui";
import { getBudgetCountryCardBreakdownItems } from "@features/budget/utils/budget-country-card.utils";

interface BudgetCountryCardProps {
  readonly match: BudgetMatch;
  readonly budget: number;
  readonly rank: number;
  readonly expanded?: boolean;
  readonly onToggle?: () => void;
  readonly compareMode?: boolean;
  readonly isSelected?: boolean;
}

export function BudgetCountryCard({
  match,
  budget,
  rank,
  expanded = false,
  onToggle,
  compareMode = false,
  isSelected = false,
}: BudgetCountryCardProps) {
  const { country, comfortScore, monthlyCost, surplus, breakdown } = match;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(rank, isSelected);
  const breakdownCards = getBudgetCountryCardBreakdownItems(breakdown, t);

  return (
    <div
      data-selected={isSelected ? "true" : undefined}
      className="country-row relative overflow-hidden border-b border-surface-2 bg-[var(--row-bg)] transition-colors duration-150"
      style={{ "--row-bg": rowBg, "--row-hover-bg": hoverBg } as React.CSSProperties}
    >
      {/* Compare mode: checkbox */}
      {compareMode ? <CompareCheckbox isSelected={isSelected} uncheckedBg={rowBg} /> : null}

      {/* Main row — clickable button */}
      <button
        className={`flex w-full cursor-pointer flex-col border-none bg-transparent text-left transition-colors ${compareMode ? "pr-4 pl-[38px]" : "px-4"} py-3`}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex w-full items-center gap-3">
          {/* Rank */}
          <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent">
            {rank}
          </span>

          {/* Flag + Name + region */}
          <CountryNameCell country={country} />

          {/* Cost + surplus */}
          <div className="hidden shrink-0 flex-col items-end sm:flex">
            <span className="font-mono text-[13px] text-tertiary">
              ${monthlyCost.toLocaleString()}
            </span>
            <span className={`font-mono text-[11px] ${surplusColourClass(surplus, "text")}`}>
              {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
            </span>
          </div>

          {/* Comfort score */}
          <div className="w-12 shrink-0 text-right">
            <span
              className={`font-mono text-lg font-bold ${comfortScoreColourClass(comfortScore, "text")}`}
            >
              {comfortScore.toFixed(0)}
            </span>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={18}
            className={`shrink-0 text-dimmest transition-transform duration-200 ${expanded ? "rotate-90" : "rotate-0"}`}
          />
        </div>

        {/* Breakdown bar */}
        <div className="mt-2 ml-[60px]">
          <BudgetBreakdownChart breakdown={breakdown} budget={budget} monthlyCost={monthlyCost} />
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded ? (
        <div
          className="border-t border-[var(--bc)] bg-[#0A0A0A] px-4 py-4"
          style={{ "--bc": borderColor } as React.CSSProperties}
        >
          {/* Summary row */}
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
                {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}{" "}
                {t("budget.surplus", "surplus")}
              </span>
            </div>
          </div>

          {/* Category cards grid — matching CountryPage style */}
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

          {/* View country details button — at the bottom */}
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      ) : null}
    </div>
  );
}
