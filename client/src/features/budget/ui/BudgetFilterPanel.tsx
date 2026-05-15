import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { useBudgetState } from "@features/budget/hooks";
import { BudgetCategoryFilter } from "./BudgetCategoryFilter";
import { BudgetLifestyleSection } from "./BudgetLifestyleSection";
import { BudgetQualityFilter } from "./BudgetQualityFilter";
type BudgetStateReturn = ReturnType<typeof useBudgetState>;
interface BudgetFilterPanelProps {
  readonly bs: BudgetStateReturn;
}
export function BudgetFilterPanel({ bs }: BudgetFilterPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState({ lifestyle: true, categories: true });
  const toggle = (key: keyof typeof open) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const budgetPct = ((bs.budget - 300) / 9700) * 100;

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#1E1E22] bg-[#131416]">
      {/* Budget slider */}
      <div className="border-b border-[#242424] p-4">
        <div className="mb-3 flex items-end gap-2">
          <span className="font-mono text-[28px] leading-none font-semibold text-on-surface">
            ${bs.budget.toLocaleString()}
          </span>
          <span className="pb-0.5 text-xs text-dimmer">{t("budget.perMonth", "/month")}</span>
        </div>
        <input
          name="compare-budget-amount"
          type="range"
          min={300}
          max={10_000}
          step={50}
          value={bs.budget}
          onChange={(e) => {
            bs.setBudget(Number(e.target.value));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full [background:linear-gradient(to_right,var(--color-accent)_0%,var(--color-accent)_var(--pct),#333333_var(--pct),#333333_100%)]"
          style={{ "--pct": `${budgetPct}%` } as React.CSSProperties}
          aria-label={t("a11y.budgetSlider", "Budget slider")}
        />
        <div className="mt-1.5 flex justify-between">
          <span className="text-[10px] text-dimmer">$300</span>
          <span className="text-[10px] text-dimmer">$10,000</span>
        </div>
      </div>

      <BudgetQualityFilter qualityBlend={bs.qualityBlend} setQualityBlend={bs.setQualityBlend} />

      <BudgetLifestyleSection
        bedrooms={bs.bedrooms}
        setBedrooms={bs.setBedrooms}
        housing={bs.housing}
        setHousing={bs.setHousing}
        peopleCount={bs.peopleCount}
        setPeopleCount={bs.setPeopleCount}
        isOpen={open.lifestyle}
        onToggle={() => {
          toggle("lifestyle");
        }}
      />

      <BudgetCategoryFilter
        categoryWeights={bs.categoryWeights}
        handleCategoryWeight={bs.handleCategoryWeight}
        isOpen={open.categories}
        onToggle={() => {
          toggle("categories");
        }}
      />

      {/* Reset */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={bs.handleReset}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded rounded-[6px] border border-border bg-transparent text-[13px] font-medium text-accent-dim"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {t("weights.resetToDefaults", "Reset to defaults")}
        </button>
      </div>
    </div>
  );
}
