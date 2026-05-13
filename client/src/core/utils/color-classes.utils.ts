/**
 * Helpers that return Tailwind utility class names for dynamically computed
 * score / surplus / comfort values.  These replace the `scoreColour()`,
 * `surplusColour()`, `comfortScoreColour()`, and `tourismScoreColour()`
 * functions in contexts where a CSS class is needed instead of a hex string.
 *
 * British spelling is preserved for consistency with the rest of the utils.
 *
 * IMPORTANT: Tailwind only includes classes it can detect as complete strings
 * at build time.  All class names MUST appear as full strings in this file —
 * never assembled via template literals like `${prefix}-success`.
 */

type ColourVariant = "bg" | "text" | "fill" | "border";

// ─── Lookup tables (complete strings so Tailwind can detect them) ─────────────

const SCORE_CLASSES: Record<
  ColourVariant,
  [null: string, high: string, mid: string, ok: string, low: string]
> = {
  bg: ["bg-score-none", "bg-success", "bg-success-light", "bg-warn", "bg-danger"],
  text: ["text-score-none", "text-success", "text-success-light", "text-warn", "text-danger"],
  fill: ["fill-score-none", "fill-success", "fill-success-light", "fill-warn", "fill-danger"],
  border: [
    "border-score-none",
    "border-success",
    "border-success-light",
    "border-warn",
    "border-danger",
  ],
};

const SURPLUS_CLASSES: Record<
  ColourVariant,
  [high: string, ok: string, warn: string, danger: string]
> = {
  bg: ["bg-success", "bg-success-light", "bg-warn", "bg-danger"],
  text: ["text-success", "text-success-light", "text-warn", "text-danger"],
  fill: ["fill-success", "fill-success-light", "fill-warn", "fill-danger"],
  border: ["border-success", "border-success-light", "border-warn", "border-danger"],
};

// ─── Score (0–100 | null) ────────────────────────────────────────────────────

function scoreColourIndex(value: number | null): 0 | 1 | 2 | 3 | 4 {
  if (value === null) return 0;
  if (value >= 75) return 1;
  if (value >= 60) return 2;
  if (value >= 50) return 3;
  return 4;
}

/** Tailwind class for a score value.  Defaults to `bg-*`. */
export function scoreColourClass(value: number | null, variant: ColourVariant = "bg"): string {
  return SCORE_CLASSES[variant][scoreColourIndex(value)];
}

// ─── Tourism score (0–100) ───────────────────────────────────────────────────

function tourismScoreColourIndex(score: number): 1 | 2 | 3 | 4 {
  if (score >= 70) return 1;
  if (score >= 55) return 2;
  if (score >= 40) return 3;
  return 4;
}

/** Tailwind class for a tourism score value.  Defaults to `bg-*`. */
export function tourismScoreColourClass(score: number, variant: ColourVariant = "bg"): string {
  return SCORE_CLASSES[variant][tourismScoreColourIndex(score)];
}

// ─── Comfort score (0–100) ───────────────────────────────────────────────────

function comfortScoreColourIndex(score: number): 1 | 2 | 3 | 4 {
  if (score >= 70) return 1;
  if (score >= 50) return 2;
  if (score >= 30) return 3;
  return 4;
}

/** Tailwind class for a comfort score.  Defaults to `bg-*`. */
export function comfortScoreColourClass(score: number, variant: ColourVariant = "bg"): string {
  return SCORE_CLASSES[variant][comfortScoreColourIndex(score)];
}

// ─── Budget surplus / deficit (USD / month) ──────────────────────────────────

function surplusColourIndex(surplus: number): 0 | 1 | 2 | 3 {
  if (surplus > 200) return 0;
  if (surplus >= 0) return 1;
  if (surplus >= -200) return 2;
  return 3;
}

/** Tailwind class for a surplus value.  Defaults to `bg-*`. */
export function surplusColourClass(surplus: number, variant: ColourVariant = "bg"): string {
  return SURPLUS_CLASSES[variant][surplusColourIndex(surplus)];
}
