import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  House,
  ShoppingCart,
  UtensilsCrossed,
  Bus,
  Zap,
  Laptop,
  Heart,
} from "lucide-react";
import { useLangPrefix } from "@core/hooks";
import type { BudgetMatch } from "@features/budget/hooks";
import { BudgetBreakdownChart } from "./BudgetBreakdownChart";
import { COST_COLORS } from "@features/budget/constants";
import { surplusColourClass, comfortScoreColourClass } from "@core/utils";
import { ViewCountryButton } from "@core/ui/country";
import { CompareCheckbox } from "@features/compare/ui";
import { getRowStyles } from "@core/utils";
import { CountryNameCell } from "@core/ui/country";

interface Props {
  match: BudgetMatch;
  budget: number;
  rank: number;
  expanded?: boolean;
  onToggle?: () => void;
  compareMode?: boolean;
  isSelected?: boolean;
}

export function BudgetCountryCard({
  match,
  budget,
  rank,
  expanded = false,
  onToggle,
  compareMode = false,
  isSelected = false,
}: Props) {
  const { country, comfortScore, monthlyCost, surplus, breakdown } = match;
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  const { bgColor: rowBg, hoverBg, borderColor } = getRowStyles(rank, isSelected);

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
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] gap-3">
            {(
              [
                {
                  key: "housing" as const,
                  icon: <House size={14} color={COST_COLORS.housing} />,
                  label: t("budget.categories.housing"),
                },
                {
                  key: "groceries" as const,
                  icon: <ShoppingCart size={14} color={COST_COLORS.groceries} />,
                  label: t("budget.categories.groceries"),
                },
                {
                  key: "dining" as const,
                  icon: <UtensilsCrossed size={14} color={COST_COLORS.dining} />,
                  label: t("budget.categories.dining"),
                },
                {
                  key: "transport" as const,
                  icon: <Bus size={14} color={COST_COLORS.transport} />,
                  label: t("budget.categories.transport"),
                },
                {
                  key: "utilities" as const,
                  icon: <Zap size={14} color={COST_COLORS.utilities} />,
                  label: t("budget.categories.utilities"),
                },
                {
                  key: "coworking" as const,
                  icon: <Laptop size={14} color={COST_COLORS.coworking} />,
                  label: t("budget.categories.coworking"),
                },
                {
                  key: "healthInsurance" as const,
                  icon: <Heart size={14} color={COST_COLORS.healthInsurance} />,
                  label: t("budget.categories.healthInsurance"),
                },
              ] as const
            )
              .filter(({ key }) => breakdown[key] > 0)
              .map(({ key, icon, label }) => (
                <div
                  key={key}
                  className="flex flex-col gap-1.5 rounded-lg border border-[#1E1E1E] bg-[#111111] p-4"
                >
                  <div className="flex items-center gap-2.5">
                    {icon}
                    <span className="font-mono text-xl font-bold text-on-surface">
                      ${breakdown[key].toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-dimmer">{label}</span>
                </div>
              ))}
          </div>

          {/* View country details button — at the bottom */}
          <ViewCountryButton to={`${langPrefix}/country/${country.code.toLowerCase()}`} />
        </div>
      ) : null}
    </div>
  );
}
