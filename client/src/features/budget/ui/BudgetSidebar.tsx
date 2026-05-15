import type { Dispatch, SetStateAction } from "react";
import type { BudgetState } from "@features/budget/types/budget.types";
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
  return (
    <>
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
