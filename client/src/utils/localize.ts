import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { CountryData } from "./types";

/**
 * Returns localized name, capital, and region for a country
 * based on the current i18next language.
 */
export function useLocalizedCountry(country: CountryData | null | undefined) {
  const { i18n } = useTranslation();
  const lang = i18n.language as "ru" | "ua" | string;

  return useMemo(() => {
    if (!country) return { name: "", capital: "", region: "" };
    const loc =
      lang === "ru" || lang === "ua" ? country.i18n?.[lang] : undefined;
    return {
      name: loc?.name ?? country.name,
      capital: loc?.capital ?? country.capital,
    };
  }, [lang, country]);
}

/**
 * Non-hook version for use in loops/maps.
 */
export function localizeCountry(
  country: CountryData,
  lang: string,
): { name: string; capital: string } {
  const loc =
    lang === "ru" || lang === "ua"
      ? country.i18n?.[lang as "ru" | "ua"]
      : undefined;
  return {
    name: loc?.name ?? country.name,
    capital: loc?.capital ?? country.capital,
  };
}

/**
 * Returns the i18n translation key for a region string.
 * Maps "Middle East" → "MiddleEast" for i18n lookup.
 */
export function regionKey(region: string): string {
  return region.replace(/\s+/g, "");
}
