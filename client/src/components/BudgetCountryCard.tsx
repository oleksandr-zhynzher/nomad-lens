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
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { BudgetMatch } from "../hooks/useBudgetMatcher";
import { BudgetBreakdownChart } from "./BudgetBreakdownChart";
import { COST_COLORS } from "../utils/budgetColors";
import { surplusColourClass, comfortScoreColourClass } from "../utils/colorClasses";
import { ViewCountryButton } from "../shared/ui/ViewCountryButton";
import { CompareCheckbox } from "../shared/ui/CompareCheckbox";
import { getRowStyles } from "../utils/rowStyles";
import { CountryNameCell } from "../shared/ui/CountryNameCell";

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
      className="country-row overflow-hidden transition-colors duration-150 relative border-b border-surface-2"
      style={{
        backgroundColor: rowBg,
        ["--row-hover-bg" as string]: hoverBg,
      }}
    >
      {/* Compare mode: checkbox */}
      {compareMode && <CompareCheckbox isSelected={!!isSelected} uncheckedBg={rowBg} />}

      {/* Main row — clickable button */}
      <button
        className={`w-full text-left flex flex-col transition-colors bg-transparent border-none cursor-pointer ${compareMode ? "pl-[38px] pr-4" : "px-4"} py-3`}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Rank */}
          <span className="font-mono font-bold text-accent w-7 text-center shrink-0 text-base">
            {rank}
          </span>

          {/* Flag + Name + region */}
          <CountryNameCell country={country} />

          {/* Cost + surplus */}
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <span className="font-mono text-[13px] text-tertiary">
              ${monthlyCost.toLocaleString()}
            </span>
            <span className={`font-mono text-[11px] ${surplusColourClass(surplus, "text")}`}>
              {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
            </span>
          </div>

          {/* Comfort score */}
          <div className="shrink-0 w-12 text-right">
            <span
              className={`font-mono text-lg font-bold ${comfortScoreColourClass(comfortScore, "text")}`}
            >
              {comfortScore.toFixed(0)}
            </span>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={18}
            className="shrink-0 text-dimmest transition-transform duration-200"
            style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </div>

        {/* Breakdown bar */}
        <div className="mt-2 ml-[60px]">
          <BudgetBreakdownChart breakdown={breakdown} budget={budget} monthlyCost={monthlyCost} />
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 py-4 bg-[#0A0A0A]" style={{ borderTop: `1px solid ${borderColor}` }}>
          {/* Summary row */}
          <div className="flex items-center justify-between mb-3">
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
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
          >
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
                  className="bg-[#111111] rounded-lg border border-[#1E1E1E] p-4 flex flex-col gap-1.5"
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
      )}
    </div>
  );
}
