/** Returns green if the value equals the minimum (cheapest), white otherwise. */
export function costColor(value: number, min: number): string {
  if (value <= min) return "#4CAF50";
  return "#FFFFFF";
}
