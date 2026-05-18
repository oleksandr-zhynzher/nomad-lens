import { useLangPrefix } from "@core/hooks";
import { CountryNameCell } from "@core/ui/country";
import { CompareCheckbox } from "@core/ui/selection";
import { comfortScoreColourClass, getRowStyles, surplusColourClass } from "@core/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import { ChevronRight } from "lucide-react";
import type React from "react";

import { BudgetBreakdownChart } from "./BudgetBreakdownChart";
import { BudgetExpandedPanel } from "./BudgetExpandedPanel";

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
  const langPrefix = useLangPrefix();
  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(rank, isSelected);

  return (
    <div
      data-selected={isSelected ? "true" : undefined}
      className="country-row relative overflow-hidden border-b border-surface-2 bg-[var(--row-bg)] transition-colors duration-150"
      style={{ "--row-bg": rowBg, "--row-hover-bg": hoverBg } as React.CSSProperties}
    >
      {compareMode ? <CompareCheckbox isSelected={isSelected} uncheckedBg={rowBg} /> : null}
      <button
        className={`flex w-full cursor-pointer flex-col border-none bg-transparent text-left transition-colors ${compareMode ? "pr-4 pl-[38px]" : "px-4"} py-3`}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex w-full items-center gap-3">
          <span className="w-7 shrink-0 text-center font-mono text-base font-bold text-accent">
            {rank}
          </span>
          <CountryNameCell country={country} />
          <div className="hidden shrink-0 flex-col items-end sm:flex">
            <span className="font-mono text-[13px] text-tertiary">
              ${monthlyCost.toLocaleString()}
            </span>
            <span className={`font-mono text-[11px] ${surplusColourClass(surplus, "text")}`}>
              {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
            </span>
          </div>
          <div className="w-12 shrink-0 text-right">
            <span
              className={`font-mono text-lg font-bold ${comfortScoreColourClass(comfortScore, "text")}`}
            >
              {comfortScore.toFixed(0)}
            </span>
          </div>
          <ChevronRight
            size={18}
            className={`shrink-0 text-dimmest transition-transform duration-200 ${expanded ? "rotate-90" : "rotate-0"}`}
          />
        </div>
        <div className="mt-2 ml-[60px]">
          <BudgetBreakdownChart breakdown={breakdown} budget={budget} monthlyCost={monthlyCost} />
        </div>
      </button>
      {expanded ? (
        <BudgetExpandedPanel match={match} borderColor={borderColor} langPrefix={langPrefix} />
      ) : null}
    </div>
  );
}
