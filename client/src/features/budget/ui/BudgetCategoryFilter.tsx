import { useLangPrefix } from "@core/hooks";
import { CollapsibleSection, WeightSliderRow } from "@core/ui/panels";
import { BUDGET_CATEGORY_KEYS } from "@features/budget/constants";
import type { BudgetCategoryWeights } from "@features/budget/models";
import { Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface BudgetCategoryFilterProps {
  readonly categoryWeights: BudgetCategoryWeights;
  readonly handleCategoryWeight: (key: keyof BudgetCategoryWeights, value: number) => void;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

export function BudgetCategoryFilter({
  categoryWeights,
  handleCategoryWeight,
  isOpen,
  onToggle,
}: BudgetCategoryFilterProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  const avgCategoryWeight = Math.round(
    (Object.values(categoryWeights) as number[]).reduce((a, b) => a + b, 0) /
      BUDGET_CATEGORY_KEYS.length,
  );

  return (
    <CollapsibleSection
      id="budget-categories"
      icon={<Sliders size={16} color="#C2956A" />}
      label={t("budget.categoryWeights", "CATEGORY WEIGHTS")}
      badge={
        <div className="flex items-center rounded-[3px] bg-[#291608] px-2 py-[3px]">
          <span className="font-mono text-[11px] text-accent-dim">
            {t("weights.averageBadge")} {avgCategoryWeight}
          </span>
        </div>
      }
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="py-1">
        {BUDGET_CATEGORY_KEYS.map((key) => (
          <div key={key} className="px-4 py-2.5">
            <WeightSliderRow
              inputName={`${key}-compare-budget-weight`}
              value={categoryWeights[key]}
              onChange={(v) => {
                handleCategoryWeight(key, v);
              }}
              ariaLabel={t(`budget.categories.${key}`, key)}
              label={
                <Link
                  to={`${langPrefix}/budget-categories`}
                  className="text-xs text-white no-underline"
                >
                  {t(`budget.categories.${key}`, key)}
                </Link>
              }
            />
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
