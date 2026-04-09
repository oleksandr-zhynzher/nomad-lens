export function tokenizeCountryCodesParam(param: string | null): string[] {
  return (param ?? "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
}

export function normalizeCountryCodes(
  codes: Iterable<string>,
  validCodes?: ReadonlySet<string>,
): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const code of codes) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode || seen.has(normalizedCode)) continue;
    if (validCodes && !validCodes.has(normalizedCode)) continue;
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
