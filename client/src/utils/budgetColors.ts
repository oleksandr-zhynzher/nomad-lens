/**
 * Color scale for a 0–100 comfort/fit score (different thresholds than the
 * general scoreColour — budget comfort uses 70/50/30 bands).
 */
export function comfortScoreColour(score: number): string {
  if (score >= 70) return "#4CAF50";
  if (score >= 50) return "#8BC34A";
  if (score >= 30) return "#FFC107";
  return "#FF5722";
}

/** Color scale for a budget surplus/deficit value (in USD/month). */
export function surplusColour(surplus: number): string {
  if (surplus > 200) return "#4CAF50";
  if (surplus >= 0) return "#8BC34A";
  if (surplus >= -200) return "#FFC107";
  return "#FF5722";
}

/** Canonical color palette for budget cost categories */
export const COST_COLORS: Record<string, string> = {
  housing: "#8F5A3C",
  groceries: "#6B9E6B",
  dining: "#C2956A",
  transport: "#5B8FA8",
  utilities: "#7A9B6B",
  coworking: "#8B7BAD",
  healthInsurance: "#C07A9B",
};

/** Color palette for tourism daily-budget breakdown */
export const TOURISM_COST_COLORS: Record<string, string> = {
  accommodation: "#8F5A3C",
  food: "#6B9E6B",
  transport: "#5B8FA8",
  activities: "#C2956A",
};
