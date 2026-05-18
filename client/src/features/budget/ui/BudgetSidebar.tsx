import type { BudgetState } from "@features/budget/types/budget.types";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { BudgetAmountSection } from "./BudgetAmountSection";
import { BudgetCategorySection } from "./BudgetCategorySection";
import { BudgetPersonSection } from "./BudgetPersonSection";
import { BudgetQualitySection } from "./BudgetQualitySection";
import { BudgetShareSection } from "./BudgetShareSection";

export interface BudgetSidebarProps {
  readonly bs: BudgetState;
  readonly langPrefix: string;
  readonly collapsed: Record<string, boolean>;
  readonly toggle: (key: string) => void;
  readonly budgetPct: number;
  readonly copied: boolean;
  readonly setCopied: Dispatch<SetStateAction<boolean>>;
}

export function BudgetSidebar({
  bs,
  langPrefix,
  collapsed,
  toggle,
  budgetPct,
  copied,
  setCopied,
}: BudgetSidebarProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex-shrink-0 border-b border-[#2A2A2A] p-[14px_16px]">
        <h2 className="text-[13px] font-semibold tracking-[2px] text-white uppercase">
          {t("budgetSettings.title", "Budget Settings")}
        </h2>
        <p className="mt-1.5 text-[10px] leading-[1.5] text-dim">
          {t(
            "budgetSettings.hint",
            "Set your monthly budget and lifestyle preferences to find matching countries.",
          )}
        </p>
      </div>

      <BudgetAmountSection budget={bs.budget} setBudget={bs.setBudget} budgetPct={budgetPct} />

      <BudgetQualitySection qualityBlend={bs.qualityBlend} setQualityBlend={bs.setQualityBlend} />

      <BudgetPersonSection
        bedrooms={bs.bedrooms}
        setBedrooms={bs.setBedrooms}
        housing={bs.housing}
        setHousing={bs.setHousing}
        peopleCount={bs.peopleCount}
        setPeopleCount={bs.setPeopleCount}
        collapsed={collapsed}
        toggle={toggle}
      />

      <BudgetCategorySection
        categoryWeights={bs.categoryWeights}
        handleCategoryWeight={bs.handleCategoryWeight}
        collapsed={collapsed}
        toggle={toggle}
        langPrefix={langPrefix}
      />

      <BudgetShareSection
        isDefault={bs.isDefault}
        handleShare={bs.handleShare}
        handleReset={bs.handleReset}
        copied={copied}
        setCopied={setCopied}
      />
    </>
  );
}
