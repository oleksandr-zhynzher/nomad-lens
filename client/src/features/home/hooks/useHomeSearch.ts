import { useLatestRef } from "@core/hooks";
import type { RankedCountry } from "@core/models";
import { localizeCountry } from "@core/utils";
import type { SearchMode } from "@features/home/models/search.models";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function scrollCountryIntoView(code: string) {
  const el = document.querySelector(`[data-country-code="${code}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function useHomeSearch(
  ranked: RankedCountry[],
  lang: string,
  setExpandedCode: Dispatch<SetStateAction<string | null>>,
) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("filter");
  const [matchCursor, setMatchCursor] = useState(0);
  const [navCursor, setNavCursor] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setExpandedCodeRef = useLatestRef(setExpandedCode);

  const matchingCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return [];
    return ranked
      .filter(
        (r) =>
          localizeCountry(r.country, lang).name.toLowerCase().includes(q) ||
          r.country.code.toLowerCase() === q,
      )
      .map((r) => r.country.code);
  }, [ranked, search, lang]);

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setMatchCursor(0);
  }, []);

  useEffect(() => {
    if (matchingCodes.length === 0) return;
    const code = matchingCodes[matchCursor % matchingCodes.length];
    if (code !== undefined) scrollCountryIntoView(code);
  }, [matchCursor, matchingCodes]);

  const goNext = useCallback(() => {
    setMatchCursor((c) => (matchingCodes.length > 0 ? (c + 1) % matchingCodes.length : 0));
  }, [matchingCodes]);

  const goPrev = useCallback(() => {
    setMatchCursor((c) =>
      matchingCodes.length > 0 ? (c - 1 + matchingCodes.length) % matchingCodes.length : 0,
    );
  }, [matchingCodes]);

  const allCodes = useMemo(() => ranked.map((r) => r.country.code), [ranked]);
  const activeNavCursor =
    navCursor !== null && navCursor >= 0 && navCursor < allCodes.length ? navCursor : null;

  useEffect(() => {
    if (activeNavCursor === null || activeNavCursor >= allCodes.length) return;
    const code = allCodes[activeNavCursor];
    if (code !== undefined) scrollCountryIntoView(code);
  }, [activeNavCursor, allCodes]);

  const searchRef = useLatestRef(search);
  const searchModeRef = useLatestRef(searchMode);
  const matchingCodesRef = useLatestRef(matchingCodes);
  const matchCursorRef = useLatestRef(matchCursor);
  const activeNavCursorRef = useLatestRef(activeNavCursor);
  const allCodesRef = useLatestRef(allCodes);
  const goNextRef = useLatestRef(goNext);
  const goPrevRef = useLatestRef(goPrev);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSearchInput = e.target === searchInputRef.current;
      const currentSearch = searchRef.current;
      const currentSearchMode = searchModeRef.current;
      const currentMatchingCodes = matchingCodesRef.current;
      const currentMatchCursor = matchCursorRef.current;
      const currentActiveNavCursor = activeNavCursorRef.current;
      const currentAllCodes = allCodesRef.current;

      if (e.key === "Enter") {
        let highlighted: string | null = null;
        if (currentSearch.trim().length > 0) {
          highlighted = currentMatchingCodes[currentMatchCursor] ?? null;
        } else if (currentActiveNavCursor !== null) {
          highlighted = currentAllCodes[currentActiveNavCursor] ?? null;
        }
        if (highlighted !== null) {
          e.preventDefault();
          setExpandedCodeRef.current((c) => (c === highlighted ? null : highlighted));
        }
        return;
      }

      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (
        !isSearchInput &&
        (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      )
        return;
      e.preventDefault();

      if (currentSearch.trim().length > 0) {
        if (currentSearchMode === "highlight") {
          if (e.key === "ArrowDown") goNextRef.current();
          else goPrevRef.current();
        }
      } else if (!isSearchInput) {
        setNavCursor((c) => {
          const len = currentAllCodes.length;
          if (len === 0) return null;
          if (c === null) return e.key === "ArrowDown" ? 0 : len - 1;
          return e.key === "ArrowDown" ? (c + 1) % len : (c - 1 + len) % len;
        });
      }
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- all deps are stable refs; including them would cause listener re-registration on every render
  }, []);

  const displayedRanked = useMemo(() => {
    if (searchMode === "filter" && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      return ranked.filter(
        (r) =>
          localizeCountry(r.country, lang).name.toLowerCase().includes(q) ||
          r.country.code.toLowerCase() === q,
      );
    }
    return ranked;
  }, [ranked, search, searchMode, lang]);

  return {
    search,
    updateSearch,
    searchMode,
    setSearchMode,
    matchingCodes,
    matchCursor,
    setMatchCursor,
    goNext,
    goPrev,
    displayedRanked,
    searchInputRef,
    allCodes,
    activeNavCursor,
  };
}
