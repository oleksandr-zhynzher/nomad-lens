import { setOptionalSearchParam } from "./url-search.utils";

const COUNTRY_CODES_PARAM = "c";

export function tokenizeCountryCodesParam(param: string | null): string[] {
  const tokens: string[] = [];

  for (const code of (param ?? "").split(",")) {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode !== "") tokens.push(normalizedCode);
  }

  return tokens;
}

export function normalizeCountryCodes(
  codes: Iterable<string>,
  validCodes?: ReadonlySet<string>,
): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const code of codes) {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode === "" || seen.has(normalizedCode)) continue;
    if (validCodes !== undefined && !validCodes.has(normalizedCode)) continue;
    seen.add(normalizedCode);
    normalized.push(normalizedCode);
  }

  return normalized;
}

export function parseCountryCodesParam(
  param: string | null,
  validCodes?: ReadonlySet<string>,
): string[] {
  return normalizeCountryCodes(tokenizeCountryCodesParam(param), validCodes);
}

export function getRawCompareCountryCodes(params: URLSearchParams): string[] {
  return tokenizeCountryCodesParam(params.get(COUNTRY_CODES_PARAM));
}

export function parseCompareCountryCodes(
  params: URLSearchParams,
  validCountryCodes?: ReadonlySet<string>,
): string[] {
  return normalizeCountryCodes(getRawCompareCountryCodes(params), validCountryCodes);
}

export function setCompareCountryCodesParam(params: URLSearchParams, countryCodes: string[]) {
  setOptionalSearchParam(
    params,
    COUNTRY_CODES_PARAM,
    countryCodes.length > 0 ? countryCodes.join(",") : null,
  );
}
