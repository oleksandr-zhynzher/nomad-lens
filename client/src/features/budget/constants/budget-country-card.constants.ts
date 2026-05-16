import { Bus, Heart, House, Laptop, ShoppingCart, UtensilsCrossed, Zap } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import type { BudgetCategoryKey } from "./budget.constants";

type BudgetCategoryIcon = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number;
    color?: string;
  }
>;

export interface BudgetCountryCardCategoryTemplate {
  readonly key: BudgetCategoryKey;
  readonly Icon: BudgetCategoryIcon;
  readonly labelKey: `budget.categories.${BudgetCategoryKey}`;
}

export const BUDGET_COUNTRY_CARD_CATEGORY_TEMPLATES: readonly BudgetCountryCardCategoryTemplate[] =
  [
    { key: "housing", Icon: House, labelKey: "budget.categories.housing" },
    { key: "groceries", Icon: ShoppingCart, labelKey: "budget.categories.groceries" },
    { key: "dining", Icon: UtensilsCrossed, labelKey: "budget.categories.dining" },
    { key: "transport", Icon: Bus, labelKey: "budget.categories.transport" },
    { key: "utilities", Icon: Zap, labelKey: "budget.categories.utilities" },
    { key: "coworking", Icon: Laptop, labelKey: "budget.categories.coworking" },
    { key: "healthInsurance", Icon: Heart, labelKey: "budget.categories.healthInsurance" },
  ];
