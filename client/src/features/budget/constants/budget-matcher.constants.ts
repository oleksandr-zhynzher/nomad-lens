import type { BudgetCategoryWeights } from "@features/budget/hooks";
import { Bus, HeartPulse, House, Laptop, ShoppingCart, UtensilsCrossed, Wifi } from "lucide-react";

export const BUDGET_CATEGORIES: Array<{
  readonly key: keyof BudgetCategoryWeights;
  readonly icon: typeof House;
}> = [
  { key: "housing", icon: House },
  { key: "groceries", icon: ShoppingCart },
  { key: "dining", icon: UtensilsCrossed },
  { key: "transport", icon: Bus },
  { key: "utilities", icon: Wifi },
  { key: "coworking", icon: Laptop },
  { key: "healthInsurance", icon: HeartPulse },
];
