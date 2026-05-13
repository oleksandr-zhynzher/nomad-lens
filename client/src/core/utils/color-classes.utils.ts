/**
 * Helpers that return Tailwind utility class names for dynamically computed
 * score / surplus / comfort values.  These replace the `scoreColour()`,
 * `surplusColour()`, `comfortScoreColour()`, and `tourismScoreColour()`
 * functions in contexts where a CSS class is needed instead of a hex string.
 *
 * British spelling is preserved for consistency with the rest of the utils.
 */

type ColourVariant = "bg" | "text" | "fill" | "border";

// ─── Score (0–100 | null) ────────────────────────────────────────────────────

function scoreColourName(value: number | null): string {
  if (value === null) return "score-none";
  if (value >= 75) return "success";
  if (value >= 60) return "success-light";
  if (value >= 50) return "warn";
  return "danger";
}

/** Tailwind class for a score value.  Defaults to `bg-*`. */
export function scoreColourClass(value: number | null, variant: ColourVariant = "bg"): string {
  return `${variant}-${scoreColourName(value)}`;
}

// ─── Tourism score (0–100) ───────────────────────────────────────────────────

function tourismScoreColourName(score: number): string {
  if (score >= 70) return "success";
  if (score >= 55) return "success-light";
  if (score >= 40) return "warn";
  return "danger";
}

/** Tailwind class for a tourism score value.  Defaults to `bg-*`. */
export function tourismScoreColourClass(score: number, variant: ColourVariant = "bg"): string {
  return `${variant}-${tourismScoreColourName(score)}`;
}

// ─── Comfort score (0–100) ───────────────────────────────────────────────────

function comfortScoreColourName(score: number): string {
  if (score >= 70) return "success";
  if (score >= 50) return "success-light";
  if (score >= 30) return "warn";
  return "danger";
}

/** Tailwind class for a comfort score.  Defaults to `bg-*`. */
export function comfortScoreColourClass(score: number, variant: ColourVariant = "bg"): string {
  return `${variant}-${comfortScoreColourName(score)}`;
}

// ─── Budget surplus / deficit (USD / month) ──────────────────────────────────

function surplusColourName(surplus: number): string {
  if (surplus > 200) return "success";
  if (surplus >= 0) return "success-light";
  if (surplus >= -200) return "warn";
  return "danger";
}

/** Tailwind class for a surplus value.  Defaults to `bg-*`. */
export function surplusColourClass(surplus: number, variant: ColourVariant = "bg"): string {
  return `${variant}-${surplusColourName(surplus)}`;
}
