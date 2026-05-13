import type { VisaCountry } from "./visa-comparison.types";

export function getCurrencySymbol(currency: string): string {
  if (currency === "EUR") return "€";
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  return currency;
}

export function getLocalizedVisa(country: VisaCountry, lang: string) {
  const visa = country.nomadVisa;
  const loc = lang === "ru" || lang === "ua" ? visa.i18n?.[lang] : undefined;
  return { visa, loc };
}
