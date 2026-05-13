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
