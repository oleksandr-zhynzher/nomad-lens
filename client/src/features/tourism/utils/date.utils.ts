/**
 * Generate localised month option objects for a <select> or similar control.
 *
 * @param locale - BCP 47 locale tag (e.g. "en", "ua" is remapped to "uk").
 * @returns Array of 12 objects with `value` (zero-padded month number) and
 *          `label` (abbreviated month name in the resolved locale).
 */
export function getMonthOptions(locale: string): Array<{ value: string; label: string }> {
  const resolvedLocale = locale === "ua" ? "uk" : locale;
  return Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1).padStart(2, "0"),
    label: new Intl.DateTimeFormat(resolvedLocale, { month: "short" }).format(
      new Date(2000, index, 1),
    ),
  }));
}
