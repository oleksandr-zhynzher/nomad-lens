export interface RowStyles {
  bgColor: string;
  hoverBg: string;
  borderColor: string;
}

/**
 * Derive alternating row background colours for country list cards.
 *
 * @param index     - Zero-based row index (or rank) used to determine even/odd.
 * @param isSelected - When `true`, the row receives the "selected" background.
 */
export function getRowStyles(index: number, isSelected = false): RowStyles {
  const isEven = index % 2 === 0;
  return {
    bgColor: isSelected ? "#1A2A1A" : isEven ? "#1A1A1C" : "#161618",
    hoverBg: isEven ? "#232326" : "#202023",
    borderColor: isEven ? "#252527" : "#1F1F21",
  };
}
