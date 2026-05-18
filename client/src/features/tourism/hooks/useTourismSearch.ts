import type { SearchMode } from "@features/tourism/models/search.models";
import type { TourismRanked } from "@features/tourism/utils";
import { filterRanked, findMatchingCodes } from "@features/tourism/utils/search.utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useTourismSearch(ranked: TourismRanked[], language: string) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("filter");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [matchCursor, setMatchCursor] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const matchingCodes = useMemo(
    () => findMatchingCodes(ranked, search.trim().toLowerCase(), language, searchMode),
    [search, searchMode, ranked, language],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      if (searchMode === "highlight" && matchingCodes.length > 0) {
        const matchingCode = matchingCodes[matchCursor % matchingCodes.length];
        setHighlightedCode(matchingCode ?? null);
      } else {
        setHighlightedCode(null);
      }
    }, 0);
    return () => {
      clearTimeout(id);
    };
  }, [matchingCodes, matchCursor, searchMode]);

  useEffect(() => {
    if (highlightedCode == null) return;
    const el = document.querySelector(`[data-country-code="${highlightedCode}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCode]);

  const goNext = useCallback(() => {
    setMatchCursor(matchingCodes.length > 0 ? (matchCursor + 1) % matchingCodes.length : 0);
  }, [matchingCodes.length, matchCursor]);

  const goPrev = useCallback(() => {
    setMatchCursor(
      matchingCodes.length > 0
        ? (matchCursor - 1 + matchingCodes.length) % matchingCodes.length
        : 0,
    );
  }, [matchingCodes.length, matchCursor]);

  const displayedRanked = useMemo(
    () => filterRanked(ranked, search, searchMode, language),
    [ranked, search, searchMode, language],
  );

  const activeHighlight = searchMode === "highlight" ? highlightedCode : undefined;

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setMatchCursor(0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setHighlightedCode(null);
    setMatchCursor(0);
  }, []);

  return {
    search,
    updateSearch,
    clearSearch,
    searchMode,
    setSearchMode,
    matchingCodes,
    matchCursor,
    setMatchCursor,
    goNext,
    goPrev,
    displayedRanked,
    activeHighlight,
    searchInputRef,
  };
}
