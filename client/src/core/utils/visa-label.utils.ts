type TranslateFn = (key: string) => string;

export function getTaxStatusLabel(
  status: "exempt" | "standard" | "special",
  t: TranslateFn,
): string {
  if (status === "exempt") return t("countryPage.taxExemptLabel");
  if (status === "special") return t("countryPage.specialTaxLabel");
  return t("countryPage.standardTaxLabel");
}
