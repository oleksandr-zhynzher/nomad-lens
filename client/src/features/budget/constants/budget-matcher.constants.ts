import { House, ShoppingCart, UtensilsCrossed, Bus, Wifi, Laptop, HeartPulse } from "lucide-react";
import type { BudgetCategoryWeights } from "@features/budget/hooks";

export const SKELETON_KEYS = ["sk0", "sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7"] as const;

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
