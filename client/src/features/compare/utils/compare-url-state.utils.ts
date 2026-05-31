import { setCompareCountryCodesParam } from "@core/utils/country-code-url.utils";
import { setOptionalSearchParam } from "@core/utils/url-search.utils";

export {
  getRawCompareCountryCodes,
  normalizeCountryCodes,
  parseCompareCountryCodes,
  setCompareCountryCodesParam,
} from "@core/utils/country-code-url.utils";

export const COMPARE_MODES = ["countries", "regions", "nomadVisas", "budget", "tourism"] as const;

export type CompareMode = (typeof COMPARE_MODES)[number];

const COMPARE_MODE_PARAM = "m";
const DEFAULT_COMPARE_MODE: CompareMode = "countries";

function isCompareMode(value: string | null): value is CompareMode {
  return value !== null && (COMPARE_MODES as readonly string[]).includes(value);
}

export function parseCompareMode(params: URLSearchParams): CompareMode {
  const value = params.get(COMPARE_MODE_PARAM);
  return isCompareMode(value) ? value : DEFAULT_COMPARE_MODE;
}

export function setCompareModeParam(params: URLSearchParams, mode: CompareMode) {
  setOptionalSearchParam(params, COMPARE_MODE_PARAM, mode === DEFAULT_COMPARE_MODE ? null : mode);
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
