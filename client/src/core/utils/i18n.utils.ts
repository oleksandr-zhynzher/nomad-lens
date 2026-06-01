// Supported non-English locale segments in the URL path
const SUPPORTED_LANGS = ["ua", "ru"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export function isSupportedLang(lang: string): lang is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(lang);
}

/** Language switcher options shown in the Layout header */
export const LANG_OPTIONS = [
  { code: "en" as const, label: "English" },
  { code: "ua" as const, label: "Українська" },
  { code: "ru" as const, label: "Русский" },
] as const;
