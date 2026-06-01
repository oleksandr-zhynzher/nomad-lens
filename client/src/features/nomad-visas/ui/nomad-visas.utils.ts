export function visaRowClass(isSelected: boolean, isHighlighted: boolean): string {
  const base = "cursor-pointer border-b border-[#1E1E1E] transition-colors";
  if (isSelected) return `${base} bg-[#1A2A1A]`;
  if (isHighlighted) return `${base} bg-[#1A1208]`;
  return `${base} bg-transparent`;
}

export function budgetCellClass(budget: number | null, maxBudget: number): string {
  if (budget != null && budget <= maxBudget)
    return "font-mono text-sm font-semibold text-[#44CC66]";
  if (budget == null) return "font-mono text-sm font-semibold text-dimmest";
  return "font-mono text-sm font-semibold text-white";
}

export { applyClimate, compareVisaRows, computeOverallScore } from "../model";
export { getTaxStatusLabel } from "@core/utils/visa-label.utils";
