import { setOptionalSearchParam } from "@features/compare/utils";
import { normalizeCountryCodes, tokenizeCountryCodesParam } from "@features/compare/utils";

export const COMPARE_MODES = ["countries", "regions", "nomadVisas", "budget", "tourism"] as const;

export type CompareMode = (typeof COMPARE_MODES)[number];

const COMPARE_MODE_PARAM = "m";
const COUNTRY_CODES_PARAM = "c";
const DEFAULT_COMPARE_MODE: CompareMode = "countries";

function isCompareMode(value: string | null): value is CompareMode {
  return value !== null && (COMPARE_MODES as readonly string[]).includes(value);
}

export function parseCompareMode(params: URLSearchParams): CompareMode {
  const value = params.get(COMPARE_MODE_PARAM);
  return isCompareMode(value) ? value : DEFAULT_COMPARE_MODE;
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

export function setCompareModeParam(params: URLSearchParams, mode: CompareMode) {
  setOptionalSearchParam(params, COMPARE_MODE_PARAM, mode === DEFAULT_COMPARE_MODE ? null : mode);
}

export function setCompareCountryCodesParam(params: URLSearchParams, countryCodes: string[]) {
  setOptionalSearchParam(
    params,
    COUNTRY_CODES_PARAM,
    countryCodes.length > 0 ? countryCodes.join(",") : null,
  );
}

export function buildCompareShareParams(
  mode: CompareMode,
  countryCodes: string[],
): URLSearchParams {
  const params = new URLSearchParams();
  setCompareCountryCodesParam(params, countryCodes);
  setCompareModeParam(params, mode);
  return params;
}
