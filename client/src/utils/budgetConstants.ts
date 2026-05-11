import { House, ShoppingCart, UtensilsCrossed, Bus, Wifi, Laptop, HeartPulse } from "lucide-react";
import type { BudgetBreakdown } from "../hooks/useBudgetMatcher";

/** Ordered budget category keys — used across breakdown chart, comparison table, and filter panel */
export const BUDGET_CATEGORY_KEYS = [
  "housing",
  "groceries",
  "dining",
  "transport",
  "utilities",
  "coworking",
  "healthInsurance",
] as const;

export type BudgetCategoryKey = (typeof BUDGET_CATEGORY_KEYS)[number];

export const BREAKDOWN_ROWS: {
  key: keyof BudgetBreakdown;
  icon: typeof House;
}[] = [
  { key: "housing", icon: House },
  { key: "groceries", icon: ShoppingCart },
  { key: "dining", icon: UtensilsCrossed },
  { key: "transport", icon: Bus },
  { key: "utilities", icon: Wifi },
  { key: "coworking", icon: Laptop },
  { key: "healthInsurance", icon: HeartPulse },
];

export const BUDGET_COMPARISON_COLUMN_WIDTH = "112px";

/** Returns green if the value equals the minimum (cheapest), white otherwise */
export function costColor(value: number, min: number): string {
  if (value <= min) return "#4CAF50";
  return "#FFFFFF";
}
