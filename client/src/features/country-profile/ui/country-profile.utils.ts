import type { NomadVisaDetails, NomadVisaLocalization } from "@core/models";
import type { TaxStatus } from "./country-profile.types";

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function localizeVisa<T>(
  defaultValue: T,
  visa: NomadVisaDetails,
  pick: (loc: NomadVisaLocalization) => T | undefined,
  lang: string,
): T {
  if (lang === "ru" || lang === "ua") {
    const loc = visa.i18n?.[lang];
    if (loc) {
      const translated = pick(loc);
      if (translated !== undefined) return translated;
    }
  }
  return defaultValue;
}

export function taxStatusBgClass(status: TaxStatus): string {
  if (status === "exempt") return "bg-[#0A2010]";
  if (status === "special") return "bg-[#1A0A1A]";
  return "bg-[#1A1A0A]";
}

export function taxStatusTextClass(status: TaxStatus): string {
  if (status === "exempt") return "text-[#44CC66]";
  if (status === "special") return "text-[#9B8FB4]";
  return "text-[#C2956A]";
}

export function taxStatusLabelKey(status: TaxStatus): string {
  if (status === "exempt") return "countryPage.taxExemptLabel";
  if (status === "special") return "countryPage.specialTaxLabel";
  return "countryPage.standardTaxLabel";
}
