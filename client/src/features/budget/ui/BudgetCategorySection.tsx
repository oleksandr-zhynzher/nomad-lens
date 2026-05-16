import { BUDGET_CATEGORIES } from "@features/budget/constants";
import type { BudgetCategoryWeights } from "@features/budget/models";
import { ChevronDown, Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface BudgetCategorySectionProps {
  readonly categoryWeights: BudgetCategoryWeights;
  readonly handleCategoryWeight: (key: keyof BudgetCategoryWeights, value: number) => void;
  readonly collapsed: Record<string, boolean>;
  readonly toggle: (key: string) => void;
  readonly langPrefix: string;
}

export function BudgetCategorySection({
  categoryWeights,
  handleCategoryWeight,
  collapsed,
  toggle,
  langPrefix,
}: BudgetCategorySectionProps) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-[#242424]">
      <button
        className="flex h-10 w-full items-center gap-2 bg-transparent px-3.5"
        onClick={() => {
          toggle("categories");
        }}
      >
        <Sliders size={16} color="#C2956A" />
        <span className="flex-1 text-left text-[10px] font-semibold tracking-[1.5px] text-muted uppercase">
          {t("budget.categoryWeights", "CATEGORY WEIGHTS")}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-dimmer transition-transform duration-150 ${collapsed["categories"] ? "-rotate-90" : "rotate-0"}`}
        />
      </button>

      {collapsed["categories"] ? null : (
        <div className="pt-0.5 pb-0.5">
          {BUDGET_CATEGORIES.map(({ key, icon: Icon }) => (
            <div key={key} className="px-4 py-2.5">
              <div className="flex flex-col gap-[9px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} color="#9E9E9E" />
                    <Link
                      to={`${langPrefix}/budget-categories`}
                      className="text-xs font-normal text-white no-underline"
                    >
                      {t(`budget.categories.${key}`)}
                    </Link>
                  </div>
                  <span className="font-mono text-[11px] text-accent-dim">
                    {categoryWeights[key]}
                  </span>
                </div>
                <input
                  name={`${key}-budget-weight`}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={categoryWeights[key]}
                  onChange={(e) => {
                    handleCategoryWeight(key, Number(e.target.value));
                  }}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${categoryWeights[key]}%, #333333 ${categoryWeights[key]}%, #333333 100%)`,
                  }}
                  aria-label={`${key} weight`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
