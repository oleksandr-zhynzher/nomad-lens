import { localizeCountry } from "@core/utils";
import type { SearchMode } from "@features/tourism/models/search.models";
import type { TourismRanked } from "@features/tourism/utils";

export function findMatchingCodes(
  ranked: TourismRanked[],
  query: string,
  lang: string,
  searchMode: SearchMode,
): string[] {
  if (query === "" || searchMode !== "highlight") return [];
  const codes: string[] = [];
  for (const r of ranked) {
    if (localizeCountry(r.country, lang).name.toLowerCase().includes(query)) {
      codes.push(r.country.code);
    }
  }
  return codes;
}

export function filterRanked(
  ranked: TourismRanked[],
  search: string,
  searchMode: SearchMode,
  lang: string,
): TourismRanked[] {
  const q = search.trim().toLowerCase();
  if (q === "" || searchMode === "highlight") return ranked;
  return ranked.filter((r) => localizeCountry(r.country, lang).name.toLowerCase().includes(q));
}

export function toggleSetItem<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}
