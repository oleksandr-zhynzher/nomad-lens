import type { SearchMode } from "./home.types";

export function getSearchPaddingRight(
  isEmpty: boolean,
  mode: SearchMode,
  hasTrimmed: boolean,
): string {
  if (isEmpty) return "16px";
  if (mode === "highlight" && hasTrimmed) return "164px";
  return "72px";
}

export function getActiveHighlight(
  searchMode: SearchMode,
  search: string,
  matchingCodes: readonly string[],
  matchCursor: number,
  activeNavCursor: number | null,
  highlightedCode: string | null,
  allCodes: readonly string[],
): string | null {
  if (searchMode === "highlight" && search.trim().length > 0) {
    return matchingCodes[matchCursor] ?? null;
  }
  if (activeNavCursor === null) return highlightedCode;
  return allCodes[activeNavCursor] ?? null;
}
