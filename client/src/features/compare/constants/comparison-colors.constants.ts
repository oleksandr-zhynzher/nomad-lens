/** 12 distinct muted accent colours for comparison slots (country cards). */
export const COMPARISON_SLOT_COLORS = [
  "#8F5A3C",
  "#5B8FA8",
  "#6B9E6B",
  "#B07CC6",
  "#E07C4F",
  "#4EA8B0",
  "#C75D8E",
  "#7B9E3C",
  "#D4A04A",
  "#6889C7",
  "#A66BBF",
  "#4CAF8B",
] as const;

export function getComparisonSlotColor(index: number): string {
  const length = COMPARISON_SLOT_COLORS.length;
  const normalizedIndex = ((index % length) + length) % length;
  return COMPARISON_SLOT_COLORS[normalizedIndex] ?? COMPARISON_SLOT_COLORS[0];
}
