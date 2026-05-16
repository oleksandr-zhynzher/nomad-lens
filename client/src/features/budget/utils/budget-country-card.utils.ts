import type { TFunction } from "i18next";
import { COST_COLORS } from "@features/budget/constants";
import {
  BUDGET_COUNTRY_CARD_CATEGORY_TEMPLATES,
  type BudgetCountryCardCategoryTemplate,
} from "@features/budget/constants/budget-country-card.constants";
import type { BudgetBreakdown } from "@features/budget/models";

interface BudgetCountryCardBreakdownItem {
  readonly key: BudgetCountryCardCategoryTemplate["key"];
  readonly Icon: BudgetCountryCardCategoryTemplate["Icon"];
  readonly color: string;
  readonly label: string;
  readonly value: number;
}

export function getBudgetCountryCardBreakdownItems(
  breakdown: BudgetBreakdown,
  t: TFunction,
): BudgetCountryCardBreakdownItem[] {
  return BUDGET_COUNTRY_CARD_CATEGORY_TEMPLATES.flatMap(({ key, Icon, labelKey }) => {
    const value = breakdown[key];
    if (value <= 0) return [];
    const color = COST_COLORS[key] ?? "#666666";
    return [{ key, Icon, color, label: t(labelKey), value }];
  });
}
